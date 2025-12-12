import { NextResponse } from "next/server";
import { hasCronSecret } from "@/utils/cron";
import { withError } from "@/utils/middleware";
import { captureException } from "@/utils/error";
import { createScopedLogger } from "@/utils/logger";
import prisma from "@/utils/prisma";
import { createEmailProvider } from "@/utils/email/provider";
import { processHistoryItem } from "@/utils/webhook/process-history-item";
import { validateWebhookAccount } from "@/utils/webhook/validate-webhook-account";
import { ImapProvider } from "@/utils/email/imap";

const logger = createScopedLogger("api/cron/imap-sync");

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes

async function syncImapAccounts() {
  const accounts = await prisma.connectionConfig.findMany({
    select: {
      emailAccountId: true,
    },
  });

  logger.info(`Found ${accounts.length} IMAP accounts to sync`);

  for (const { emailAccountId } of accounts) {
    const accountLogger = logger.with({ emailAccountId });
    
    try {
      const emailAccount = await prisma.emailAccount.findUnique({
        where: { id: emailAccountId },
        include: {
            account: true,
            rules: {
                include: {
                    actions: true,
                }
            },
            user: {
                include: {
                    premium: true,
                }
            }
        }
      });

      if (!emailAccount) continue;

      // Validate account state (similar to webhook validation)
      const validation = await validateWebhookAccount(emailAccount, accountLogger);
      if (!validation.success) {
        accountLogger.warn("Account validation failed", { response: validation.response });
        continue;
      }

      const {
        emailAccount: validatedEmailAccount,
        hasAutomationRules,
        hasAiAccess,
      } = validation.data;

      const provider = await createEmailProvider({
        emailAccountId,
        provider: "imap",
        logger: accountLogger,
      });

      if (!(provider instanceof ImapProvider)) {
        accountLogger.error("Provider is not IMAP provider");
        continue;
      }

      // Treat lastSyncedHistoryId as the last UID synced
      const lastUid = parseInt(emailAccount.lastSyncedHistoryId || "0", 10);
      
      accountLogger.info("Fetching messages", { lastUid });
      
      const messages = await provider.getMessagesAfterUid(isNaN(lastUid) ? 0 : lastUid);
      
      if (messages.length === 0) {
        accountLogger.info("No new messages");
        continue;
      }

      accountLogger.info(`Processing ${messages.length} new messages`);

      let maxUid = lastUid;

      for (const message of messages) {
        const uid = parseInt(message.id, 10);
        if (!isNaN(uid) && uid > maxUid) {
            maxUid = uid;
        }

        await processHistoryItem(
          {
            messageId: message.id, // for IMAP we use UID as messageId in our system mostly, or should we use message-id header? 
            // processHistoryItem expects messageId to be retrievable via provider.getMessage(id).
            // ImapProvider.getMessage(id) expects UID as id.
            // So message.id (which is UID in ImapProvider) is correct.
            preFetchedMessage: message,
          },
          {
            provider,
            emailAccount: validatedEmailAccount,
            hasAutomationRules,
            hasAiAccess,
            rules: validatedEmailAccount.rules,
            logger: accountLogger,
          }
        );
      }

      // Update lastSyncedHistoryId
      if (maxUid > lastUid) {
        await prisma.emailAccount.update({
            where: { id: emailAccountId },
            data: {
                lastSyncedHistoryId: maxUid.toString(),
            }
        });
      }

    } catch (error) {
      accountLogger.error("Error syncing IMAP account", { error });
      captureException(error, { extra: { emailAccountId } });
    }
  }

  return NextResponse.json({ success: true, count: accounts.length });
}

export const GET = withError("cron/imap-sync", async (request) => {
  if (!hasCronSecret(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  return syncImapAccounts();
});
