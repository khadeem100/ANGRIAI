import {
  getGmailClientForEmail,
  getOutlookClientForEmail,
} from "@/utils/account";
import { GmailProvider } from "@/utils/email/google";
import { OutlookProvider } from "@/utils/email/microsoft";
import {
  isGoogleProvider,
  isMicrosoftProvider,
  isImapProvider,
} from "@/utils/email/provider-types";
import type { EmailProvider } from "@/utils/email/types";
import type { Logger } from "@/utils/logger";
import { ImapProvider } from "@/utils/email/imap";
import prisma from "@/utils/prisma";

export async function createEmailProvider({
  emailAccountId,
  provider,
  logger,
}: {
  emailAccountId: string;
  provider: string;
  logger?: Logger;
}): Promise<EmailProvider> {
  if (isGoogleProvider(provider)) {
    const client = await getGmailClientForEmail({ emailAccountId });
    return new GmailProvider(client, logger);
  } else if (isMicrosoftProvider(provider)) {
    const client = await getOutlookClientForEmail({ emailAccountId });
    return new OutlookProvider(client, logger);
  }

  if (isImapProvider(provider)) {
    const config = await prisma.connectionConfig.findUnique({
      where: { emailAccountId },
    });

    if (!config) {
      throw new Error("IMAP configuration not found for this account");
    }

    return new ImapProvider(config, logger);
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
