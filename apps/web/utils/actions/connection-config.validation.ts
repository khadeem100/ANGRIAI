import { z } from "zod";

export const saveConnectionConfigSchema = z.object({
  imapHost: z.string().min(1, "IMAP Host is required"),
  imapPort: z.coerce.number().int().min(1).max(65_535),
  imapUser: z.string().min(1, "IMAP User is required"),
  imapPass: z.string().min(1, "IMAP Password is required"),
  imapSecure: z.boolean(),
  smtpHost: z.string().min(1, "SMTP Host is required"),
  smtpPort: z.coerce.number().int().min(1).max(65_535),
  smtpUser: z.string().min(1, "SMTP User is required"),
  smtpPass: z.string().min(1, "SMTP Password is required"),
  smtpSecure: z.boolean(),
});

export type SaveConnectionConfigInput = z.infer<
  typeof saveConnectionConfigSchema
>;
