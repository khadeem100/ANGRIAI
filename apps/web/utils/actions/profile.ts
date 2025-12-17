"use server";

import { z } from "zod";
import { actionClientUser } from "@/utils/actions/safe-action";
import prisma from "@/utils/prisma";

export const updateProfileAction = actionClientUser
  .metadata({ name: "updateProfile" })
  .inputSchema(
    z.object({
      name: z.string().min(1, "Name is required"),
    }),
  )
  .action(async ({ ctx: { userId }, parsedInput: { name } }) => {
    // Update user name
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailAccounts: {
          select: {
            id: true,
          },
        },
      },
    });

    // Also update all associated email accounts' names
    // This ensures the name appears in the sidebar and other places
    await prisma.emailAccount.updateMany({
      where: {
        userId: userId,
      },
      data: {
        name: name,
      },
    });

    return updatedUser;
  });
