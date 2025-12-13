import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import type {
  EmailProvider,
  EmailThread,
  EmailLabel,
  EmailSignature,
  EmailFilter,
} from "./types";
import type { ParsedMessage } from "@/utils/types";
import { createScopedLogger, type Logger } from "@/utils/logger";
import type { ConnectionConfig } from "@/generated/prisma/client";
import { decryptToken } from "@/utils/encryption";
import type { OutlookFolder } from "../outlook/folders";
import type { InboxZeroLabel } from "@/utils/label";
import type { ThreadsQuery } from "@/app/api/threads/validation";

export class ImapProvider implements EmailProvider {
  readonly name = "imap";
  private readonly config: ConnectionConfig;
  private readonly logger: Logger;

  constructor(config: ConnectionConfig, logger?: Logger) {
    this.config = config;
    this.logger = (logger || createScopedLogger("imap-provider")).with({
      provider: "imap",
      emailAccountId: config.emailAccountId,
    });
  }

  toJSON() {
    return { name: this.name, type: "ImapProvider" };
  }

  private async getImapClient() {
    const password = decryptToken(this.config.imapPass);
    if (!password) {
      throw new Error("Could not decrypt IMAP password");
    }

    const client = new ImapFlow({
      host: this.config.imapHost,
      port: this.config.imapPort,
      secure: this.config.imapSecure,
      auth: {
        user: this.config.imapUser,
        pass: password,
      },
      logger: false,
    });

    return client;
  }

  private async getSmtpTransport() {
    const password = decryptToken(this.config.smtpPass);
    if (!password) {
      throw new Error("Could not decrypt SMTP password");
    }

    return nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      auth: {
        user: this.config.smtpUser,
        pass: password,
      },
    });
  }

  async getMessagesAfterUid(
    lastUid: number,
    limit = 50,
  ): Promise<ParsedMessage[]> {
    const client = await this.getImapClient();
    await client.connect();

    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const messages: ParsedMessage[] = [];
        // UID range: (lastUid + 1):*
        const range = `${lastUid + 1}:*`;

        for await (const msg of client.fetch(range, {
          source: true,
          envelope: true,
          uid: true,
        })) {
          if (!msg.source || !msg.envelope || !msg.uid) continue;

          // Skip if we somehow got the same UID (shouldn't happen with proper range)
          if (msg.uid <= lastUid) continue;

          const parsed = await simpleParser(msg.source);

          messages.push({
            id: msg.uid.toString(),
            threadId: msg.envelope.messageId || msg.uid.toString(),
            labelIds: ["INBOX"],
            snippet: parsed.text?.substring(0, 100) || "",
            historyId: msg.seq.toString(),
            internalDate: (msg.envelope.date || new Date())
              .getTime()
              .toString(),
            // @ts-ignore
            sizeEstimate: msg.source.length || 0,
            headers: {
              from: msg.envelope.from?.[0]?.address || "",
              to: msg.envelope.to?.[0]?.address || "",
              subject: msg.envelope.subject || "",
              date: (msg.envelope.date || new Date()).toISOString(),
              "message-id": msg.envelope.messageId || "",
            },
            textPlain: parsed.text || "",
            textHtml: parsed.html || parsed.textAsHtml || "",
            inline: [],
          });

          if (messages.length >= limit) break;
        }

        return messages;
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getThreads(folderId = "INBOX"): Promise<EmailThread[]> {
    const client = await this.getImapClient();
    await client.connect();

    try {
      const lock = await client.getMailboxLock(folderId);
      try {
        const messages: ParsedMessage[] = [];

        // Fetch last 20 messages
        const status = await client.status(folderId, { messages: true });
        const total = status.messages || 0;
        const start = Math.max(1, total - 19);
        const range = `${start}:*`;

        if (total === 0) return [];

        for await (const msg of client.fetch(range, {
          source: true,
          envelope: true,
          uid: true,
        })) {
          if (!msg.source) continue;

          const parsed = await simpleParser(msg.source);
          const envelope = msg.envelope;

          if (!envelope) continue;

          messages.push({
            id: msg.uid.toString(),
            threadId: envelope.messageId || msg.uid.toString(),
            labelIds: [folderId],
            snippet: parsed.text?.substring(0, 100) || "",
            historyId: msg.seq.toString(),
            internalDate: (envelope.date || new Date()).getTime().toString(),
            // @ts-ignore
            sizeEstimate: msg.source.length || 0,
            headers: {
              from: envelope.from?.[0]?.address || "",
              to: envelope.to?.[0]?.address || "",
              subject: envelope.subject || "",
              date: (envelope.date || new Date()).toISOString(),
              "message-id": envelope.messageId || "",
            },
            textPlain: parsed.text || "",
            textHtml: parsed.html || parsed.textAsHtml || "",
            inline: [],
          });
        }

        return messages.reverse().map((msg) => ({
          id: msg.id,
          messages: [msg],
          snippet: msg.snippet,
          historyId: msg.historyId,
        }));
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getThread(threadId: string): Promise<EmailThread> {
    const message = await this.getMessage(threadId);
    return {
      id: threadId,
      messages: [message],
      snippet: message.snippet,
      historyId: message.historyId,
    };
  }

  async getLabels(): Promise<EmailLabel[]> {
    const client = await this.getImapClient();
    await client.connect();

    try {
      const mailboxes = await client.list();
      return mailboxes.map((box) => ({
        id: box.path,
        name: box.name,
        type: "system",
      }));
    } finally {
      await client.logout();
    }
  }

  async getLabelById(labelId: string): Promise<EmailLabel | null> {
    const labels = await this.getLabels();
    return labels.find((l) => l.id === labelId) || null;
  }

  async getLabelByName(name: string): Promise<EmailLabel | null> {
    const labels = await this.getLabels();
    return labels.find((l) => l.name === name) || null;
  }

  async getFolders(): Promise<OutlookFolder[]> {
    const labels = await this.getLabels();
    return labels.map((l) => ({
      id: l.id,
      displayName: l.name,
      childFolders: [],
    }));
  }

  async getMessage(messageId: string): Promise<ParsedMessage> {
    const client = await this.getImapClient();
    await client.connect();

    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const uid = Number.parseInt(messageId, 10);
        if (isNaN(uid)) throw new Error("Invalid UID");

        const message = await client.fetchOne(
          uid.toString(),
          { source: true, envelope: true, uid: true },
          { uid: true },
        );
        if (!message || !message.source || !message.envelope)
          throw new Error("Message not found");

        const parsed = await simpleParser(message.source);

        return {
          id: message.uid.toString(),
          threadId: message.uid.toString(),
          labelIds: ["INBOX"],
          snippet: parsed.text?.substring(0, 100) || "",
          historyId: message.seq.toString(),
          internalDate: (message.envelope.date || new Date())
            .getTime()
            .toString(),
          // @ts-ignore
          sizeEstimate: message.source.length || 0,
          headers: {
            from: message.envelope.from?.[0]?.address || "",
            to: message.envelope.to?.[0]?.address || "",
            subject: message.envelope.subject || "",
            date: (message.envelope.date || new Date()).toISOString(),
            "message-id": message.envelope.messageId || "",
          },
          textPlain: parsed.text || "",
          textHtml: parsed.html || parsed.textAsHtml || "",
          inline: [],
        };
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getMessageByRfc822MessageId(
    rfc822MessageId: string,
  ): Promise<ParsedMessage | null> {
    return null;
  }

  async getMessagesByFields(): Promise<any> {
    return { messages: [] };
  }

  async getSentMessages(maxResults?: number): Promise<ParsedMessage[]> {
    return [];
  }

  async getSentThreadsExcluding(): Promise<EmailThread[]> {
    return [];
  }

  async getDrafts(): Promise<ParsedMessage[]> {
    return [];
  }

  async getThreadMessages(threadId: string): Promise<ParsedMessage[]> {
    const msg = await this.getMessage(threadId);
    return [msg];
  }

  async getThreadMessagesInInbox(threadId: string): Promise<ParsedMessage[]> {
    return this.getThreadMessages(threadId);
  }

  async getPreviousConversationMessages(
    messageIds: string[],
  ): Promise<ParsedMessage[]> {
    return [];
  }

  async archiveThread(threadId: string): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const list = await client.list();
        const archivePath = list.find(
          (b) => b.name.match(/archive/i) || b.specialUse === "\\Archive",
        )?.path;

        if (!archivePath) {
          this.logger.warn("No Archive folder found, skipping archive action");
          return;
        }

        await client.messageMove(threadId, archivePath, { uid: true });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async archiveThreadWithLabel(threadId: string): Promise<void> {
    return this.archiveThread(threadId);
  }

  async archiveMessage(messageId: string): Promise<void> {
    return this.archiveThread(messageId);
  }

  async bulkArchiveFromSenders(): Promise<void> {
    // Not implemented
  }

  async bulkTrashFromSenders(): Promise<void> {
    // Not implemented
  }

  async trashThread(threadId: string): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const list = await client.list();
        const trashPath = list.find(
          (b) => b.name.match(/trash|bin/i) || b.specialUse === "\\Trash",
        )?.path;

        if (trashPath) {
          await client.messageMove(threadId, trashPath, { uid: true });
        } else {
          await client.messageFlagsAdd(threadId, ["\\Deleted"], { uid: true });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async labelMessage(options: {
    messageId: string;
    labelId: string;
    labelName: string | null;
  }): Promise<{ usedFallback?: boolean; actualLabelId?: string }> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      await client.messageMove(options.messageId, options.labelId, {
        uid: true,
      });
      return { actualLabelId: options.labelId };
    } finally {
      await client.logout();
    }
  }

  async removeThreadLabel(): Promise<void> {
    // Not applicable
  }

  async removeThreadLabels(): Promise<void> {
    // Not applicable
  }

  async draftEmail(): Promise<{ draftId: string }> {
    return { draftId: "not-implemented" };
  }

  async replyToEmail(email: ParsedMessage, content: string): Promise<void> {
    const transport = await this.getSmtpTransport();
    await transport.sendMail({
      from: {
        name: this.config.smtpUser,
        address: this.config.smtpUser,
      },
      to: email.headers.from,
      subject: email.headers.subject?.startsWith("Re:")
        ? email.headers.subject
        : `Re: ${email.headers.subject}`,
      text: content,
      inReplyTo: email.headers["message-id"],
      references: email.headers["message-id"],
    });
  }

  async sendEmail(args: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    messageText: string;
  }): Promise<void> {
    const transport = await this.getSmtpTransport();
    await transport.sendMail({
      from: {
        name: this.config.smtpUser,
        address: this.config.smtpUser,
      },
      to: args.to,
      cc: args.cc,
      bcc: args.bcc,
      subject: args.subject,
      text: args.messageText,
    });
  }

  async sendEmailWithHtml(body: {
    replyToEmail?: {
      threadId: string;
      headerMessageId: string;
      references?: string;
    };
    to: string;
    cc?: string;
    bcc?: string;
    replyTo?: string;
    subject: string;
    messageHtml: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>;
  }): Promise<{ messageId: string; threadId: string }> {
    const transport = await this.getSmtpTransport();
    const info = await transport.sendMail({
      from: {
        name: this.config.smtpUser,
        address: this.config.smtpUser,
      },
      to: body.to,
      cc: body.cc,
      bcc: body.bcc,
      replyTo: body.replyTo,
      subject: body.subject,
      html: body.messageHtml,
      attachments: body.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
      inReplyTo: body.replyToEmail?.headerMessageId,
      references: body.replyToEmail?.references,
    });

    return {
      messageId: info.messageId,
      threadId: body.replyToEmail?.threadId || info.messageId,
    };
  }

  async forwardEmail(
    email: ParsedMessage,
    args: { to: string; cc?: string; bcc?: string; content?: string },
  ): Promise<void> {
    const transport = await this.getSmtpTransport();
    await transport.sendMail({
      from: {
        name: this.config.smtpUser,
        address: this.config.smtpUser,
      },
      to: args.to,
      cc: args.cc,
      bcc: args.bcc,
      subject: `Fwd: ${email.headers.subject}`,
      text: args.content
        ? `${args.content}\n\n---------- Forwarded message ---------\nFrom: ${email.headers.from}\nDate: ${email.headers.date}\nSubject: ${email.headers.subject}\nTo: ${email.headers.to}\n\n${email.textPlain}`
        : `---------- Forwarded message ---------\nFrom: ${email.headers.from}\nDate: ${email.headers.date}\nSubject: ${email.headers.subject}\nTo: ${email.headers.to}\n\n${email.textPlain}`,
    });
  }

  async markSpam(threadId: string): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        const list = await client.list();
        const junkPath = list.find(
          (b) => b.name.match(/junk|spam/i) || b.specialUse === "\\Junk",
        )?.path;

        if (junkPath) {
          await client.messageMove(threadId, junkPath, { uid: true });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async markRead(threadId: string): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        await client.messageFlagsAdd(threadId, ["\\Seen"], { uid: true });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async markReadThread(threadId: string, read: boolean): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        if (read) {
          await client.messageFlagsAdd(threadId, ["\\Seen"], { uid: true });
        } else {
          await client.messageFlagsRemove(threadId, ["\\Seen"], { uid: true });
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getDraft(draftId: string): Promise<ParsedMessage | null> {
    return null;
  }

  async deleteDraft(draftId: string): Promise<void> {
    // No-op
  }

  async createLabel(name: string): Promise<EmailLabel> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      await client.mailboxCreate(name);
      return {
        id: name,
        name: name,
        type: "user",
      };
    } finally {
      await client.logout();
    }
  }

  async deleteLabel(labelId: string): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      await client.mailboxDelete(labelId);
    } finally {
      await client.logout();
    }
  }

  async getOrCreateInboxZeroLabel(key: InboxZeroLabel): Promise<EmailLabel> {
    return this.createLabel(key);
  }

  async blockUnsubscribedEmail(messageId: string): Promise<void> {
    // Not implemented
  }

  async getOriginalMessage(
    originalMessageId: string,
  ): Promise<ParsedMessage | null> {
    return null;
  }

  async getFiltersList(): Promise<EmailFilter[]> {
    return [];
  }

  async createFilter(): Promise<{ status: number }> {
    return { status: 501 };
  }

  async deleteFilter(): Promise<{ status: number }> {
    return { status: 501 };
  }

  async createAutoArchiveFilter(): Promise<{ status: number }> {
    return { status: 501 };
  }

  async getMessagesWithPagination(options: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
    before?: Date;
    after?: Date;
  }): Promise<{ messages: ParsedMessage[]; nextPageToken?: string }> {
    return { messages: [] };
  }

  async getMessagesFromSender(): Promise<{
    messages: ParsedMessage[];
    nextPageToken?: string;
  }> {
    return { messages: [] };
  }

  async getMessagesBatch(messageIds: string[]): Promise<ParsedMessage[]> {
    return [];
  }

  getAccessToken(): string {
    return "";
  }

  async checkIfReplySent(): Promise<boolean> {
    return false;
  }

  async countReceivedMessages(): Promise<number> {
    return 0;
  }

  async getAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<{ data: string; size: number }> {
    return { data: "", size: 0 };
  }

  async getThreadsWithQuery(options: {
    query?: ThreadsQuery;
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ threads: EmailThread[]; nextPageToken?: string }> {
    return { threads: [] };
  }

  async hasPreviousCommunicationsWithSenderOrDomain(): Promise<boolean> {
    return false;
  }

  async getThreadsFromSenderWithSubject(): Promise<any[]> {
    return [];
  }

  async processHistory(): Promise<void> {
    // Not applicable
  }

  async watchEmails(): Promise<{
    expirationDate: Date;
    subscriptionId?: string;
  } | null> {
    return null;
  }

  async unwatchEmails(): Promise<void> {
    // No-op
  }

  isReplyInThread(message: ParsedMessage): boolean {
    return !!message.headers["in-reply-to"];
  }

  isSentMessage(message: ParsedMessage): boolean {
    return message.headers.from.includes(this.config.smtpUser);
  }

  async moveThreadToFolder(
    threadId: string,
    ownerEmail: string,
    folderName: string,
  ): Promise<void> {
    const client = await this.getImapClient();
    await client.connect();
    try {
      const lock = await client.getMailboxLock("INBOX");
      try {
        await client.messageMove(threadId, folderName, { uid: true });
      } finally {
        lock.release();
      }
    } finally {
      await client.logout();
    }
  }

  async getOrCreateOutlookFolderIdByName(folderName: string): Promise<string> {
    return folderName;
  }

  async getSignatures(): Promise<EmailSignature[]> {
    return [];
  }
}
