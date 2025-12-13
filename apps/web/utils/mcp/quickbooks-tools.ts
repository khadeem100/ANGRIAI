import { z } from "zod";
import { tool } from "ai";
import type { McpConnection } from "@/generated/prisma/client";
import { zodToJsonSchema } from "zod-to-json-schema";
import { QuickBooksClient } from "@/utils/quickbooks/client";

const QB_TOOLS_SCHEMA = {
  customer_list: {
    description: "List customers (QuickBooks Customer)",
    parameters: z.object({
      limit: z.number().optional().default(10),
      query: z.string().optional().describe("Filter by DisplayName or email"),
    }),
  },
  invoice_list: {
    description: "List invoices (QuickBooks Invoice)",
    parameters: z.object({
      limit: z.number().optional().default(10),
      customer_id: z
        .string()
        .optional()
        .describe("QuickBooks CustomerRef value"),
      query: z.string().optional().describe("Filter by DocNumber"),
    }),
  },
  invoice_create: {
    description:
      "Create an invoice for a customer (minimal fields: lines with description+amount)",
    parameters: z.object({
      customer_id: z
        .string()
        .optional()
        .describe("CustomerRef value (preferred)"),
      customer_name: z
        .string()
        .optional()
        .describe("Fallback: DisplayName to find or create customer"),
      currency: z.string().optional().describe("e.g. USD, EUR"),
      lines_json: z
        .string()
        .describe(
          'JSON array of lines. Each: { "description"?: string, "amount": number } (creates DescriptionOnly lines)',
        ),
    }),
  },
};

export const getQuickBooksToolDefinitions = () => {
  return Object.entries(QB_TOOLS_SCHEMA).map(([name, def]) => ({
    name,
    description: def.description,
    inputSchema: zodToJsonSchema(def.parameters),
  }));
};

export const createQuickBooksTools = async (connection: McpConnection) => {
  const { accessToken, metadata } = connection as any;
  const realmId: string | undefined = (metadata as any)?.realmId;

  if (!accessToken || !realmId) {
    throw new Error(
      "Invalid QuickBooks connection: missing access token or realmId",
    );
  }

  const client = new QuickBooksClient({ accessToken, realmId });

  async function findOrCreateCustomerByName(displayName: string) {
    const q = `select Id, DisplayName, PrimaryEmailAddr from Customer where DisplayName = '${displayName.replace(/'/g, "''")}'`;
    const result = await client.query<any>(q);
    const items = result?.QueryResponse?.Customer || [];
    if (items.length > 0) return items[0];
    // Create
    return client.createCustomer({ DisplayName: displayName });
  }

  return {
    customer_list: tool({
      description: QB_TOOLS_SCHEMA.customer_list.description,
      inputSchema: QB_TOOLS_SCHEMA.customer_list.parameters,
      execute: async ({ limit, query }: { limit: number; query?: string }) => {
        let where = "";
        if (query) {
          const qEsc = query.replace(/'/g, "''");
          where = ` where DisplayName like '%${qEsc}%' or PrimaryEmailAddr like '%${qEsc}%'`;
        }
        const sql = `select Id, DisplayName, PrimaryEmailAddr from Customer${where} order by MetaData.CreateTime desc`;
        const result = await client.query<any>(sql);
        const list = result?.QueryResponse?.Customer || [];
        return list.slice(0, limit);
      },
    }),

    invoice_list: tool({
      description: QB_TOOLS_SCHEMA.invoice_list.description,
      inputSchema: QB_TOOLS_SCHEMA.invoice_list.parameters,
      execute: async ({
        limit,
        customer_id,
        query,
      }: {
        limit: number;
        customer_id?: string;
        query?: string;
      }) => {
        const clauses: string[] = [];
        if (customer_id)
          clauses.push(`CustomerRef = '${customer_id.replace(/'/g, "''")}'`);
        if (query)
          clauses.push(`DocNumber like '%${query.replace(/'/g, "''")}%'`);
        const where = clauses.length ? ` where ${clauses.join(" and ")}` : "";
        const sql = `select Id, DocNumber, Balance, TotalAmt, TxnDate, CustomerRef from Invoice${where} order by TxnDate desc`;
        const result = await client.query<any>(sql);
        const list = result?.QueryResponse?.Invoice || [];
        return list.slice(0, limit);
      },
    }),

    invoice_create: tool({
      description: QB_TOOLS_SCHEMA.invoice_create.description,
      inputSchema: QB_TOOLS_SCHEMA.invoice_create.parameters,
      execute: async ({
        customer_id,
        customer_name,
        currency,
        lines_json,
      }: {
        customer_id?: string;
        customer_name?: string;
        currency?: string;
        lines_json: string;
      }) => {
        let cid = customer_id;
        try {
          if (!cid && customer_name) {
            const cust = await findOrCreateCustomerByName(customer_name);
            cid = (
              cust?.Id ||
              cust?.Customer?.Id ||
              cust?.Customer?.[0]?.Id
            )?.toString();
          }
        } catch {}
        if (!cid) return { error: "Customer not found or created" };

        let lines: Array<{ description?: string; amount: number }> = [];
        try {
          const parsed = JSON.parse(lines_json);
          if (Array.isArray(parsed)) lines = parsed;
        } catch {}
        if (lines.length === 0) return { error: "No lines to invoice" };

        const qbLines = lines.map((l) => ({
          DetailType: "DescriptionOnly",
          Amount: l.amount ?? 0,
          Description: l.description || "",
        }));

        const payload: any = {
          CustomerRef: { value: cid },
          Line: qbLines,
        };
        if (currency) payload.CurrencyRef = { value: currency };

        const created = await client.createInvoice(payload);
        const invoice = created?.Invoice || created;
        return {
          id: invoice?.Id,
          docNumber: invoice?.DocNumber,
          total: invoice?.TotalAmt,
        };
      },
    }),
  } as const;
};
