import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { createEmailProvider } from "@/utils/email/provider";
import { ImapProvider } from "@/utils/email/imap";
import { processHistoryItem } from "@/utils/webhook/process-history-item";
import { validateWebhookAccount } from "@/utils/webhook/validate-webhook-account";
import prisma from "@/utils/prisma";
import { captureException } from "@/utils/error";
import { createScopedLogger } from "@/utils/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 1 minute

export const POST = withEmailAccount("user/sync-emails", async (request) => {
  const { emailAccountId } = request.auth;
  const logger = createScopedLogger("user/sync-emails");

  try {
    const emailAccount = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
      include: {
        account: true,
        ConnectionConfig: true,
        rules: {
          include: {
            actions: true,
          },
        },
        user: {
          include: {
            premium: true,
          },
        },
      },
    });

    if (!emailAccount) {
      return NextResponse.json(
        { error: "Email account not found" },
        { status: 404 },
      );
    }

    // Check if this is an IMAP account
    if (!emailAccount.ConnectionConfig) {
      return NextResponse.json(
        {
          error:
            "This account is not configured for IMAP sync. Use Google/Microsoft sync instead.",
        },
        { status: 400 },
      );
    }

    // Validate account state
    const validation = await validateWebhookAccount(emailAccount, logger);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Account validation failed", details: validation.response },
        { status: 400 },
      );
    }

    const {
      emailAccount: validatedEmailAccount,
      hasAutomationRules,
      hasAiAccess,
    } = validation.data;

    const provider = await createEmailProvider({
      emailAccountId,
      provider: "imap",
      logger,
    });

    if (!(provider instanceof ImapProvider)) {
      return NextResponse.json(
        { error: "Provider is not IMAP provider" },
        { status: 500 },
      );
    }

    // Get last synced UID
    const lastUid = Number.parseInt(
      emailAccount.lastSyncedHistoryId || "0",
      10,
    );

    logger.info("Fetching messages", { lastUid });

    const messages = await provider.getMessagesAfterUid(
      isNaN(lastUid) ? 0 : lastUid,
      100, // Fetch up to 100 messages per sync
    );

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new messages to sync",
        count: 0,
        lastUid,
      });
    }

    logger.info(`Processing ${messages.length} new messages`);

    let maxUid = lastUid;
    const processedMessages = [];

    for (const message of messages) {
      const uid = Number.parseInt(message.id, 10);
      if (!isNaN(uid) && uid > maxUid) {
        maxUid = uid;
      }

      try {
        await processHistoryItem(
          {
            messageId: message.id,
            preFetchedMessage: message,
          },
          {
            provider,
            emailAccount: validatedEmailAccount,
            hasAutomationRules,
            hasAiAccess,
            rules: validatedEmailAccount.rules,
            logger,
          },
        );

        processedMessages.push({
          id: message.id,
          subject: message.subject,
          from: message.headers.from,
        });
      } catch (error) {
        logger.error("Error processing message", {
          messageId: message.id,
          error,
        });
        // Continue processing other messages
      }
    }

    // Update lastSyncedHistoryId
    if (maxUid > lastUid) {
      await prisma.emailAccount.update({
        where: { id: emailAccountId },
        data: {
          lastSyncedHistoryId: maxUid.toString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${messages.length} messages`,
      count: messages.length,
      processed: processedMessages.length,
      lastUid: maxUid,
      messages: processedMessages.slice(0, 10), // Return first 10 for preview
    });
  } catch (error) {
    logger.error("Error syncing emails", { error });
    captureException(error, { extra: { emailAccountId } });

    return NextResponse.json(
      {
        error: "Failed to sync emails",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});
