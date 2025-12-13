import { z } from "zod";
import { tool } from "ai";
import { OdooClient } from "@/utils/odoo/client";
import { decryptToken } from "@/utils/encryption";
import type { McpConnection } from "@/generated/prisma/client";
import { zodToJsonSchema } from "zod-to-json-schema";

const ODOO_TOOLS_SCHEMA = {
  crm_lead_list: {
    description: "List CRM leads from Odoo",
    parameters: z.object({
      limit: z.number().optional().default(5),
      query: z.string().optional().describe("Search by lead name or email"),
    }),
  },
  res_partner_list: {
    description: "List customers (res.partner)",
    parameters: z.object({
      limit: z.number().optional().default(5),
      query: z
        .string()
        .optional()
        .describe("Search by customer name, email, phone, or mobile"),
    }),
  },
  res_partner_search: {
    description:
      "Search customers/companies (res.partner) by business name, email, phone, or mobile.",
    parameters: z.object({
      limit: z.number().optional().default(10),
      query: z
        .string()
        .describe(
          "Query to match against name (business/contact), email, phone, or mobile",
        ),
    }),
  },
  crm_lead_create: {
    description: "Create a new CRM lead in Odoo",
    parameters: z.object({
      name: z.string().describe("Lead name/subject"),
      email_from: z.string().optional(),
      partner_name: z.string().optional(),
      description: z.string().optional(),
    }),
  },
  project_task_list: {
    description: "List project tasks",
    parameters: z.object({
      limit: z.number().optional().default(5),
      project_id: z.number().optional(),
    }),
  },
  project_task_create: {
    description: "Create a project task",
    parameters: z.object({
      name: z.string(),
      project_id: z.number().optional(),
      description: z.string().optional(),
    }),
  },
  helpdesk_ticket_list: {
    description: "List helpdesk tickets",
    parameters: z.object({
      limit: z.number().optional().default(5),
    }),
  },
  sale_order_list: {
    description: "List sale orders",
    parameters: z.object({
      limit: z.number().optional().default(5),
      partner_id: z.number().optional().describe("Filter by customer id"),
      query: z.string().optional().describe("Filter by order name"),
    }),
  },
  invoice_list: {
    description:
      "List customer invoices (account.move with move_type out_invoice/out_refund)",
    parameters: z.object({
      limit: z.number().optional().default(5),
      partner_id: z.number().optional().describe("Filter by customer id"),
      query: z.string().optional().describe("Filter by invoice name/number"),
    }),
  },
  sale_order_create: {
    description:
      "Create a quotation/order (sale.order). Optionally confirm it.",
    parameters: z.object({
      partner_id: z.number().describe("Customer ID (res.partner)"),
      lines_json: z
        .string()
        .describe(
          'JSON array of order lines. Each item: { "product_id"?: number, "product"?: string, "name"?: string, "qty": number, "price_unit"?: number }',
        ),
      confirm: z
        .boolean()
        .optional()
        .describe("Confirm the order after create"),
      note: z.string().optional().describe("Optional note on the order"),
    }),
  },
  sale_order_confirm: {
    description: "Confirm a sale order (turn quotation into order)",
    parameters: z.object({
      order_id: z.number().describe("Sale order ID"),
    }),
  },
  sale_order_detail: {
    description: "Get sale order details including lines",
    parameters: z.object({
      order_id: z.number().optional().describe("Sale order ID"),
      name: z.string().optional().describe("Sale order name/number"),
    }),
  },
  invoice_create: {
    description:
      "Create a customer invoice (account.move) with move_type out_invoice. Optionally post it.",
    parameters: z.object({
      partner_id: z.number().describe("Customer ID (res.partner)"),
      lines_json: z
        .string()
        .describe(
          'JSON array of invoice lines. Each item: { "product_id"?: number, "product"?: string, "name"?: string, "qty": number, "price_unit"?: number }',
        ),
      post: z.boolean().optional().describe("Post the invoice after create"),
      invoice_date: z.string().optional().describe("ISO date for invoice_date"),
    }),
  },
  invoice_post: {
    description: "Post an invoice (account.move action_post)",
    parameters: z.object({
      move_id: z.number().describe("Invoice ID (account.move)"),
    }),
  },
  invoice_detail: {
    description: "Get invoice details including lines",
    parameters: z.object({
      move_id: z.number().optional().describe("Invoice ID"),
      name: z.string().optional().describe("Invoice name/number"),
    }),
  },
  product_list: {
    description:
      "List products (product.product) with basic stock information (qty_available)",
    parameters: z.object({
      limit: z.number().optional().default(20),
      query: z
        .string()
        .optional()
        .describe(
          "Search by product name or internal reference (default_code) in Odoo",
        ),
    }),
  },
  product_search: {
    description:
      "Search products (product.product) by product name or internal reference (default_code).",
    parameters: z.object({
      limit: z.number().optional().default(20),
      query: z
        .string()
        .describe("Query to match against name and/or default_code (SKU)"),
    }),
  },
  product_update_stock: {
    description:
      "Update on-hand stock quantity for a product using Odoo's stock.change.product.qty wizard.",
    parameters: z
      .object({
        product_id: z
          .number()
          .optional()
          .describe("Odoo product ID (product.product)"),
        default_code: z
          .string()
          .optional()
          .describe(
            "Internal reference / SKU (default_code) to locate the product if product_id is not known",
          ),
        new_quantity: z
          .number()
          .describe("New on-hand quantity for this product in Odoo"),
      })
      .refine((v) => v.product_id !== undefined || !!v.default_code, {
        message: "Either product_id or default_code must be provided",
      }),
  },
};

export const getOdooToolDefinitions = () => {
  return Object.entries(ODOO_TOOLS_SCHEMA).map(([name, def]) => ({
    name,
    description: def.description,
    inputSchema: zodToJsonSchema(def.parameters),
  }));
};

export const createOdooTools = async (connection: McpConnection) => {
  const { apiKey, metadata } = connection;
  const password = decryptToken(apiKey);
  const { url, db, username } = metadata as any;

  if (!url || !db || !username || !password) {
    throw new Error("Invalid Odoo connection metadata");
  }

  const client = new OdooClient({ url, db, username, password });

  return {
    crm_lead_list: tool({
      description: ODOO_TOOLS_SCHEMA.crm_lead_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.crm_lead_list.parameters,
      execute: async ({ limit, query }: { limit: number; query?: string }) => {
        const domain: any[] = query
          ? ["|", ["name", "ilike", query], ["email_from", "ilike", query]]
          : [];
        return client.searchRead(
          "crm.lead",
          domain,
          ["name", "email_from", "partner_name", "stage_id", "probability"],
          limit,
        );
      },
    }),
    res_partner_list: tool({
      description: ODOO_TOOLS_SCHEMA.res_partner_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.res_partner_list.parameters,
      execute: async ({ limit, query }: { limit: number; query?: string }) => {
        const domain: any[] = query
          ? [
              "|",
              "|",
              "|",
              ["name", "ilike", query],
              ["email", "ilike", query],
              ["phone", "ilike", query],
              ["mobile", "ilike", query],
            ]
          : [];
        return client.searchRead(
          "res.partner",
          domain,
          ["name", "email", "phone", "mobile", "is_company", "parent_id"],
          limit,
        );
      },
    }),
    res_partner_search: tool({
      description: ODOO_TOOLS_SCHEMA.res_partner_search.description,
      inputSchema: ODOO_TOOLS_SCHEMA.res_partner_search.parameters,
      execute: async ({ limit, query }: { limit: number; query: string }) => {
        const domain: any[] = [
          "|",
          "|",
          "|",
          ["name", "ilike", query],
          ["email", "ilike", query],
          ["phone", "ilike", query],
          ["mobile", "ilike", query],
        ];
        return client.searchRead(
          "res.partner",
          domain,
          ["name", "email", "phone", "mobile", "is_company", "parent_id"],
          limit,
        );
      },
    }),
    crm_lead_create: tool({
      description: ODOO_TOOLS_SCHEMA.crm_lead_create.description,
      inputSchema: ODOO_TOOLS_SCHEMA.crm_lead_create.parameters,
      execute: async (values: any) => {
        const id = await client.create("crm.lead", values);
        return { id, message: "Lead created successfully" };
      },
    }),
    project_task_list: tool({
      description: ODOO_TOOLS_SCHEMA.project_task_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.project_task_list.parameters,
      execute: async ({
        limit,
        project_id,
      }: {
        limit: number;
        project_id?: number;
      }) => {
        const domain = project_id ? [["project_id", "=", project_id]] : [];
        return client.searchRead(
          "project.task",
          domain,
          ["name", "project_id", "user_ids", "stage_id", "date_deadline"],
          limit,
        );
      },
    }),
    project_task_create: tool({
      description: ODOO_TOOLS_SCHEMA.project_task_create.description,
      inputSchema: ODOO_TOOLS_SCHEMA.project_task_create.parameters,
      execute: async (values: any) => {
        const id = await client.create("project.task", values);
        return { id, message: "Task created successfully" };
      },
    }),
    helpdesk_ticket_list: tool({
      description: ODOO_TOOLS_SCHEMA.helpdesk_ticket_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.helpdesk_ticket_list.parameters,
      execute: async ({ limit }: { limit: number }) => {
        return client.searchRead(
          "helpdesk.ticket",
          [],
          ["name", "partner_id", "stage_id", "user_id"],
          limit,
        );
      },
    }),
    sale_order_list: tool({
      description: ODOO_TOOLS_SCHEMA.sale_order_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.sale_order_list.parameters,
      execute: async ({
        limit,
        partner_id,
        query,
      }: {
        limit: number;
        partner_id?: number;
        query?: string;
      }) => {
        let baseDomain: any[] = [];
        if (query) baseDomain = [["name", "ilike", query]];
        const combinedDomain = partner_id
          ? [...baseDomain, ["partner_id", "=", partner_id]]
          : baseDomain;
        return client.searchRead(
          "sale.order",
          combinedDomain,
          ["name", "partner_id", "state", "amount_total", "date_order"],
          limit,
        );
      },
    }),
    invoice_list: tool({
      description: ODOO_TOOLS_SCHEMA.invoice_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.invoice_list.parameters,
      execute: async ({
        limit,
        partner_id,
        query,
      }: {
        limit: number;
        partner_id?: number;
        query?: string;
      }) => {
        let baseDomain: any[] = [];
        if (query) baseDomain = [["name", "ilike", query]];
        const moveTypeDomain: any[] = [
          "|",
          ["move_type", "=", "out_invoice"],
          ["move_type", "=", "out_refund"],
        ];
        let combinedDomain: any[] = [...baseDomain, ...moveTypeDomain];
        if (partner_id) {
          combinedDomain = [...combinedDomain, ["partner_id", "=", partner_id]];
        }
        return client.searchRead(
          "account.move",
          combinedDomain,
          [
            "name",
            "partner_id",
            "invoice_date",
            "amount_total",
            "payment_state",
            "state",
          ],
          limit,
        );
      },
    }),
    sale_order_create: tool({
      description: ODOO_TOOLS_SCHEMA.sale_order_create.description,
      inputSchema: ODOO_TOOLS_SCHEMA.sale_order_create.parameters,
      execute: async ({
        partner_id,
        lines_json,
        confirm,
        note,
      }: {
        partner_id: number;
        lines_json: string;
        confirm?: boolean;
        note?: string;
      }) => {
        let lines: Array<{
          product_id?: number;
          product?: string;
          name?: string;
          qty: number;
          price_unit?: number;
        }> = [];
        try {
          const parsed = JSON.parse(lines_json);
          if (Array.isArray(parsed)) lines = parsed;
        } catch {}

        const orderLineCommands: any[] = [];
        for (const l of lines) {
          let pid = l.product_id;
          if (!pid && l.product) {
            const found = await client.searchRead(
              "product.product",
              [["name", "ilike", l.product]],
              ["name"],
              1,
            );
            if (Array.isArray(found) && found[0]?.id) pid = found[0].id;
          }
          const lineVals: any = {
            product_uom_qty: l.qty ?? 1,
          };
          if (pid) lineVals.product_id = pid;
          if (typeof l.price_unit === "number")
            lineVals.price_unit = l.price_unit;
          if (!pid && l.name) lineVals.name = l.name;
          orderLineCommands.push([0, 0, lineVals]);
        }

        const values: any = {
          partner_id,
          order_line: orderLineCommands,
        };
        if (note) values.note = note;

        const orderId = await client.create("sale.order", values);
        if (confirm) {
          try {
            await client.execute("sale.order", "action_confirm", [[orderId]]);
          } catch {}
        }
        return { id: orderId, confirmed: !!confirm };
      },
    }),
    sale_order_confirm: tool({
      description: ODOO_TOOLS_SCHEMA.sale_order_confirm.description,
      inputSchema: ODOO_TOOLS_SCHEMA.sale_order_confirm.parameters,
      execute: async ({ order_id }: { order_id: number }) => {
        await client.execute("sale.order", "action_confirm", [[order_id]]);
        return { id: order_id, status: "confirmed" };
      },
    }),
    sale_order_detail: tool({
      description: ODOO_TOOLS_SCHEMA.sale_order_detail.description,
      inputSchema: ODOO_TOOLS_SCHEMA.sale_order_detail.parameters,
      execute: async ({
        order_id,
        name,
      }: {
        order_id?: number;
        name?: string;
      }) => {
        let order: any | null = null;
        if (!order_id && name) {
          const found = await client.searchRead(
            "sale.order",
            [["name", "ilike", name]],
            ["name", "partner_id", "state", "amount_total", "date_order"],
            1,
          );
          if (Array.isArray(found) && found[0]?.id) order_id = found[0].id;
        }
        if (!order_id) return { error: "Order not found" };

        const orders = await client.searchRead(
          "sale.order",
          [["id", "=", order_id]],
          ["name", "partner_id", "state", "amount_total", "date_order"],
          1,
        );
        order = Array.isArray(orders) ? orders[0] : null;

        const lines = await client.searchRead(
          "sale.order.line",
          [["order_id", "=", order_id]],
          [
            "product_id",
            "product_uom_qty",
            "price_unit",
            "price_total",
            "name",
          ],
          100,
        );
        return { order, lines };
      },
    }),
    invoice_create: tool({
      description: ODOO_TOOLS_SCHEMA.invoice_create.description,
      inputSchema: ODOO_TOOLS_SCHEMA.invoice_create.parameters,
      execute: async ({
        partner_id,
        lines_json,
        post,
        invoice_date,
      }: {
        partner_id: number;
        lines_json: string;
        post?: boolean;
        invoice_date?: string;
      }) => {
        let lines: Array<{
          product_id?: number;
          product?: string;
          name?: string;
          qty: number;
          price_unit?: number;
        }> = [];
        try {
          const parsed = JSON.parse(lines_json);
          if (Array.isArray(parsed)) lines = parsed;
        } catch {}

        const invoiceLineCommands: any[] = [];
        for (const l of lines) {
          let pid = l.product_id;
          if (!pid && l.product) {
            const found = await client.searchRead(
              "product.product",
              [["name", "ilike", l.product]],
              ["name"],
              1,
            );
            if (Array.isArray(found) && found[0]?.id) pid = found[0].id;
          }
          const lineVals: any = {
            quantity: l.qty ?? 1,
          };
          if (pid) lineVals.product_id = pid;
          if (typeof l.price_unit === "number")
            lineVals.price_unit = l.price_unit;
          if (!pid && l.name) lineVals.name = l.name;
          invoiceLineCommands.push([0, 0, lineVals]);
        }

        const values: any = {
          move_type: "out_invoice",
          partner_id,
          invoice_line_ids: invoiceLineCommands,
        };
        if (invoice_date) values.invoice_date = invoice_date;

        const moveId = await client.create("account.move", values);
        if (post) {
          try {
            await client.execute("account.move", "action_post", [[moveId]]);
          } catch {}
        }
        return { id: moveId, posted: !!post };
      },
    }),
    invoice_post: tool({
      description: ODOO_TOOLS_SCHEMA.invoice_post.description,
      inputSchema: ODOO_TOOLS_SCHEMA.invoice_post.parameters,
      execute: async ({ move_id }: { move_id: number }) => {
        await client.execute("account.move", "action_post", [[move_id]]);
        return { id: move_id, status: "posted" };
      },
    }),
    invoice_detail: tool({
      description: ODOO_TOOLS_SCHEMA.invoice_detail.description,
      inputSchema: ODOO_TOOLS_SCHEMA.invoice_detail.parameters,
      execute: async ({
        move_id,
        name,
      }: {
        move_id?: number;
        name?: string;
      }) => {
        if (!move_id && name) {
          const found = await client.searchRead(
            "account.move",
            [["name", "ilike", name]],
            ["name"],
            1,
          );
          if (Array.isArray(found) && found[0]?.id) move_id = found[0].id;
        }
        if (!move_id) return { error: "Invoice not found" };

        const invoices = await client.searchRead(
          "account.move",
          [["id", "=", move_id]],
          [
            "name",
            "partner_id",
            "invoice_date",
            "invoice_origin",
            "amount_total",
            "payment_state",
            "state",
          ],
          1,
        );
        const invoice = Array.isArray(invoices) ? invoices[0] : null;
        const lines = await client.searchRead(
          "account.move.line",
          [["move_id", "=", move_id]],
          ["product_id", "quantity", "price_unit", "price_subtotal", "name"],
          200,
        );
        return { invoice, lines };
      },
    }),
    product_list: tool({
      description: ODOO_TOOLS_SCHEMA.product_list.description,
      inputSchema: ODOO_TOOLS_SCHEMA.product_list.parameters,
      execute: async ({ limit, query }: { limit: number; query?: string }) => {
        const domain: any[] = query
          ? ["|", ["name", "ilike", query], ["default_code", "ilike", query]]
          : [];
        return client.searchRead(
          "product.product",
          domain,
          ["name", "default_code", "qty_available"],
          limit,
        );
      },
    }),
    product_search: tool({
      description: ODOO_TOOLS_SCHEMA.product_search.description,
      inputSchema: ODOO_TOOLS_SCHEMA.product_search.parameters,
      execute: async ({ limit, query }: { limit: number; query: string }) => {
        const domain: any[] = [
          "|",
          ["name", "ilike", query],
          ["default_code", "ilike", query],
        ];
        return client.searchRead(
          "product.product",
          domain,
          ["name", "default_code", "qty_available"],
          limit,
        );
      },
    }),
    product_update_stock: tool({
      description: ODOO_TOOLS_SCHEMA.product_update_stock.description,
      inputSchema: ODOO_TOOLS_SCHEMA.product_update_stock.parameters,
      execute: async ({
        product_id,
        default_code,
        new_quantity,
      }: {
        product_id?: number;
        default_code?: string;
        new_quantity: number;
      }) => {
        let pid = product_id;

        if (!pid && default_code) {
          const found = await client.searchRead(
            "product.product",
            [["default_code", "=", default_code]],
            ["id", "name", "default_code"],
            1,
          );
          if (Array.isArray(found) && found[0]?.id) {
            pid = found[0].id as number;
          }
        }

        if (!pid) {
          return { error: "Product not found in Odoo for stock update" };
        }

        // Use the stock.change.product.qty wizard to adjust on-hand quantity
        const wizardId = await client.create("stock.change.product.qty", {
          product_id: pid,
          new_quantity,
        });

        try {
          await client.execute(
            "stock.change.product.qty",
            "change_product_qty",
            [[wizardId]],
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : String(error ?? "Unknown error");
          return {
            error: "Failed to apply stock change in Odoo",
            message,
            product_id: pid,
          };
        }

        return { product_id: pid, new_quantity };
      },
    }),
  };
};
