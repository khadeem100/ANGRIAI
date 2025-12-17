"use server";

import { z } from "zod";
import { actionClientUser } from "@/utils/actions/safe-action";
import { fetchWithAccount } from "@/utils/fetch";

export const purchaseIntegrationAction = actionClientUser
  .metadata({ name: "purchaseIntegration" })
  .inputSchema(
    z.object({
      integrationName: z.string(),
      emailAccountId: z.string(),
    }),
  )
  .action(
    async ({
      ctx: { userId },
      parsedInput: { integrationName, emailAccountId },
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            integrationName,
            emailAccountId,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const data = await response.json();
      return { url: data.url };
    },
  );
