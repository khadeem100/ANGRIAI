"use server";

import { actionClientUser } from "@/utils/actions/safe-action";
import { saveConnectionConfigSchema } from "./connection-config.validation";
import prisma from "@/utils/prisma";
import { encryptToken } from "@/utils/encryption";
import { revalidatePath } from "next/cache";

export const saveConnectionConfigAction = actionClientUser
  .metadata({ name: "saveConnectionConfig" })
  .inputSchema(saveConnectionConfigSchema)
  .action(async ({ parsedInput: input, ctx: { userId } }) => {
    // 1. Create a new EmailAccount for this custom connection
    const email = input.imapUser;
    
    // Check if account already exists for this user
    let emailAccount = await prisma.emailAccount.findFirst({
        where: {
            userId: userId,
            email: email,
        }
    });

    if (!emailAccount) {
        // Create a "custom" provider account.
        const account = await prisma.account.create({
            data: {
                userId: userId,
                type: "custom",
                provider: "custom",
                providerAccountId: email,
                access_token: "dummy", // Not used for IMAP
                refresh_token: "dummy",
            }
        });

        emailAccount = await prisma.emailAccount.create({
            data: {
                email,
                userId: userId,
                accountId: account.id,
                name: email,
            }
        });
    }

    // 2. Save ConnectionConfig
    const imapPass = encryptToken(input.imapPass);
    const smtpPass = encryptToken(input.smtpPass);
    
    if (!imapPass || !smtpPass) {
        throw new Error("Failed to encrypt credentials");
    }

    await prisma.connectionConfig.upsert({
        where: {
            emailAccountId: emailAccount.id,
        },
        create: {
            emailAccountId: emailAccount.id,
            imapHost: input.imapHost,
            imapPort: input.imapPort,
            imapUser: input.imapUser,
            imapPass,
            imapSecure: input.imapSecure,
            smtpHost: input.smtpHost,
            smtpPort: input.smtpPort,
            smtpUser: input.smtpUser,
            smtpPass,
            smtpSecure: input.smtpSecure,
        },
        update: {
            imapHost: input.imapHost,
            imapPort: input.imapPort,
            imapUser: input.imapUser,
            imapPass,
            imapSecure: input.imapSecure,
            smtpHost: input.smtpHost,
            smtpPort: input.smtpPort,
            smtpUser: input.smtpUser,
            smtpPass,
            smtpSecure: input.smtpSecure,
        }
    });

    revalidatePath("/");
    return { emailAccountId: emailAccount.id };
  });

