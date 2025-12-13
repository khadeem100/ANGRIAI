import { z } from "zod";
import { tool } from "ai";
import type { McpConnection } from "@/generated/prisma/client";
import { zodToJsonSchema } from "zod-to-json-schema";
import { PrestashopClient } from "@/utils/prestashop/client";
import { decryptToken } from "@/utils/encryption";

const PRESTASHOP_TOOLS_SCHEMA = {
  customers_list: {
    description:
      "List customers from PrestaShop (optionally filter by email or name)",
    parameters: z.object({
      limit: z.number().optional().default(10),
      email: z.string().optional().describe("Filter by exact email address"),
      firstname: z
        .string()
        .optional()
        .describe("Filter by first name (partial match, case-insensitive)"),
      lastname: z
        .string()
        .optional()
        .describe("Filter by last name (partial match, case-insensitive)"),
      query: z
        .string()
        .optional()
        .describe(
          "Best-effort query (matches first name). PrestaShop doesn't support OR across fields; prefer customers_search for richer search.",
        ),
    }),
  },
  customers_search: {
    description:
      "Search customers in PrestaShop by name/email and also by business/company name or phone (via addresses). Returns matching customers.",
    parameters: z.object({
      limit: z.number().optional().default(10),
      email: z.string().optional().describe("Exact email address"),
      firstname: z.string().optional().describe("First name (partial)"),
      lastname: z.string().optional().describe("Last name (partial)"),
      company: z
        .string()
        .optional()
        .describe("Business/company name (partial, searched in addresses)"),
      phone: z
        .string()
        .optional()
        .describe("Phone (partial, searched in addresses)"),
      phone_mobile: z
        .string()
        .optional()
        .describe("Mobile phone (partial, searched in addresses)"),
    }),
  },
  customers_get: {
    description: "Get a single customer by id or email",
    parameters: z
      .object({
        id: z.number().optional().describe("Customer ID"),
        email: z.string().optional().describe("Customer email address"),
      })
      .refine((v) => v.id !== undefined || v.email !== undefined, {
        message: "Either id or email must be provided",
      }),
  },
  customers_delete: {
    description: "Delete a customer by ID",
    parameters: z.object({
      id: z.number().describe("Customer ID to delete"),
    }),
  },
  customers_create_xml: {
    description:
      "Create a customer using a full PrestaShop XML payload. You must provide a <prestashop><customer>...</customer></prestashop> document.",
    parameters: z.object({
      xml: z
        .string()
        .describe(
          "Full XML body for the customer resource. Follow PrestaShop Webservice schema for customers.",
        ),
    }),
  },
  customers_update_xml: {
    description:
      "Update an existing customer by ID using a full PrestaShop XML payload.",
    parameters: z.object({
      id: z.number().describe("Customer ID to update"),
      xml: z
        .string()
        .describe(
          "Full XML body for the customer resource. Follow PrestaShop Webservice schema for customers.",
        ),
    }),
  },
  products_list: {
    description: "List products (optionally filter by reference or name)",
    parameters: z.object({
      limit: z.number().optional().default(10),
      reference: z
        .string()
        .optional()
        .describe("Filter by product reference/SKU (partial match)"),
      name: z
        .string()
        .optional()
        .describe("Filter by product name (partial match)"),
      query: z
        .string()
        .optional()
        .describe(
          "Best-effort query: matches name and/or reference when possible",
        ),
    }),
  },
  products_search: {
    description:
      "Search products in PrestaShop by name and/or reference (SKU). Returns matching products.",
    parameters: z.object({
      limit: z.number().optional().default(10),
      query: z
        .string()
        .describe("Query string to match product name and/or reference"),
    }),
  },
  products_get: {
    description: "Get a single product by ID or reference",
    parameters: z
      .object({
        id: z.number().optional().describe("Product ID"),
        reference: z.string().optional().describe("Product reference"),
      })
      .refine((v) => v.id !== undefined || v.reference !== undefined, {
        message: "Either id or reference must be provided",
      }),
  },
  products_delete: {
    description: "Delete a product by ID",
    parameters: z.object({
      id: z.number().describe("Product ID to delete"),
    }),
  },
  products_create_xml: {
    description:
      "Create a product using a full PrestaShop XML payload. You must provide a <prestashop><product>...</product></prestashop> document.",
    parameters: z.object({
      xml: z
        .string()
        .describe(
          "Full XML body for the product resource. Follow PrestaShop Webservice schema for products.",
        ),
    }),
  },
  products_update_xml: {
    description:
      "Update an existing product by ID using a full PrestaShop XML payload.",
    parameters: z.object({
      id: z.number().describe("Product ID to update"),
      xml: z
        .string()
        .describe(
          "Full XML body for the product resource. Follow PrestaShop Webservice schema for products.",
        ),
    }),
  },
  orders_list: {
    description: "List orders (optionally filter by reference or customer id)",
    parameters: z.object({
      limit: z.number().optional().default(10),
      reference: z
        .string()
        .optional()
        .describe("Filter by exact order reference"),
      customer_id: z
        .number()
        .optional()
        .describe("Filter by customer ID (id_customer)"),
    }),
  },
  orders_get: {
    description: "Get a single order by ID or reference",
    parameters: z
      .object({
        id: z.number().optional().describe("Order ID"),
        reference: z.string().optional().describe("Order reference"),
      })
      .refine((v) => v.id !== undefined || v.reference !== undefined, {
        message: "Either id or reference must be provided",
      }),
  },
  orders_delete: {
    description: "Delete an order by ID",
    parameters: z.object({
      id: z.number().describe("Order ID to delete"),
    }),
  },
  orders_create_xml: {
    description:
      "Create an order using a full PrestaShop XML payload. You must provide a <prestashop><order>...</order></prestashop> document.",
    parameters: z.object({
      xml: z
        .string()
        .describe(
          "Full XML body for the order resource. Follow PrestaShop Webservice schema for orders.",
        ),
    }),
  },
  orders_update_xml: {
    description:
      "Update an existing order by ID using a full PrestaShop XML payload.",
    parameters: z.object({
      id: z.number().describe("Order ID to update"),
      xml: z
        .string()
        .describe(
          "Full XML body for the order resource. Follow PrestaShop Webservice schema for orders.",
        ),
    }),
  },
  customer_threads_list: {
    description: "List customer service threads",
    parameters: z.object({
      limit: z.number().optional().default(10),
    }),
  },
  customer_threads_get: {
    description: "Get a customer service thread by ID",
    parameters: z.object({
      id: z.number().describe("Customer thread ID"),
    }),
  },
  customer_threads_delete: {
    description: "Delete a customer service thread by ID",
    parameters: z.object({
      id: z.number().describe("Customer thread ID to delete"),
    }),
  },
  customer_threads_create_xml: {
    description:
      "Create a customer service thread using a full PrestaShop XML payload (<prestashop><customer_thread>...</customer_thread></prestashop>).",
    parameters: z.object({
      xml: z
        .string()
        .describe(
          "Full XML body for the customer_thread resource. Follow PrestaShop Webservice schema.",
        ),
    }),
  },
  customer_threads_update_xml: {
    description:
      "Update a customer service thread by ID using a full PrestaShop XML payload.",
    parameters: z.object({
      id: z.number().describe("Customer thread ID to update"),
      xml: z
        .string()
        .describe(
          "Full XML body for the customer_thread resource. Follow PrestaShop Webservice schema.",
        ),
    }),
  },
  customer_messages_create_xml: {
    description:
      "Create a customer service message in an existing thread using a full PrestaShop XML payload (<prestashop><customer_message>...</customer_message></prestashop>).",
    parameters: z.object({
      xml: z
        .string()
        .describe(
          "Full XML body for the customer_message resource. Follow PrestaShop Webservice schema.",
        ),
    }),
  },
  stock_list: {
    description:
      "List stock availability rows (stock_availables) for products. Use product_id or product_attribute_id to narrow down.",
    parameters: z.object({
      limit: z.number().optional().default(20),
      product_id: z
        .number()
        .optional()
        .describe("Filter by PrestaShop product ID (id_product)"),
      product_attribute_id: z
        .number()
        .optional()
        .describe(
          "Filter by PrestaShop product attribute ID (id_product_attribute)",
        ),
    }),
  },
  stock_update_quantity: {
    description:
      "Update the available stock quantity for a specific stock_available row by ID.",
    parameters: z.object({
      stock_available_id: z
        .number()
        .describe("ID of the stock_available row to update"),
      quantity: z
        .number()
        .describe("New available quantity for this stock_available entry"),
    }),
  },
} as const;

export const getPrestashopToolDefinitions = () => {
  return Object.entries(PRESTASHOP_TOOLS_SCHEMA).map(([name, def]) => ({
    name,
    description: def.description,
    inputSchema: zodToJsonSchema(def.parameters),
  }));
};

export const createPrestashopTools = async (connection: McpConnection) => {
  const { apiKey, metadata } = connection;
  const decryptedKey = decryptToken(apiKey);
  const { baseUrl } = (metadata as any) || {};

  if (!baseUrl || !decryptedKey) {
    throw new Error("Invalid PrestaShop connection metadata");
  }

  const client = new PrestashopClient({ baseUrl, apiKey: decryptedKey });

  return {
    customers_list: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customers_list.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customers_list.parameters,
      execute: async ({
        limit,
        email,
        firstname,
        lastname,
        query,
      }: {
        limit: number;
        email?: string;
        firstname?: string;
        lastname?: string;
        query?: string;
      }) => {
        return client.listCustomers({
          limit,
          email,
          firstname,
          lastname,
          query,
        });
      },
    }),
    customers_search: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customers_search.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customers_search.parameters,
      execute: async ({
        limit,
        email,
        firstname,
        lastname,
        company,
        phone,
        phone_mobile,
      }: {
        limit: number;
        email?: string;
        firstname?: string;
        lastname?: string;
        company?: string;
        phone?: string;
        phone_mobile?: string;
      }) => {
        const resultsById = new Map<number, any>();

        const addCustomers = (payload: any) => {
          const list = payload?.customers;
          if (Array.isArray(list)) {
            for (const c of list) {
              if (c?.id !== undefined) resultsById.set(Number(c.id), c);
            }
          }
        };

        if (email || firstname || lastname) {
          const primary = await client.listCustomers({
            limit,
            email,
            firstname,
            lastname,
          });
          addCustomers(primary);
        }

        if (company || phone || phone_mobile) {
          const addr = await client.listAddresses({
            limit,
            company,
            phone,
            phone_mobile,
          });
          const addresses = Array.isArray(addr?.addresses)
            ? addr.addresses
            : [];
          const customerIds = new Set<number>();
          for (const a of addresses) {
            if (a?.id_customer !== undefined)
              customerIds.add(Number(a.id_customer));
          }
          await Promise.all(
            Array.from(customerIds).map(async (id) => {
              try {
                const c = await client.getCustomerById(id);
                const customer = (c as any)?.customer ?? c;
                if (customer?.id !== undefined)
                  resultsById.set(Number(customer.id), customer);
              } catch {
                // ignore
              }
            }),
          );
        }

        return { customers: Array.from(resultsById.values()) };
      },
    }),
    customers_get: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customers_get.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customers_get.parameters,
      execute: async ({ id, email }: { id?: number; email?: string }) => {
        if (id !== undefined) {
          return client.getCustomerById(id);
        }
        if (email) {
          return client.getCustomerByEmail(email);
        }
        return { error: "Either id or email must be provided" };
      },
    }),
    customers_delete: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customers_delete.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customers_delete.parameters,
      execute: async ({ id }: { id: number }) => {
        await client.deleteCustomer(id);
        return { id, deleted: true };
      },
    }),
    customers_create_xml: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customers_create_xml.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customers_create_xml.parameters,
      execute: async ({ xml }: { xml: string }) => {
        return client.createResource("customers", xml);
      },
    }),
    customers_update_xml: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customers_update_xml.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customers_update_xml.parameters,
      execute: async ({ id, xml }: { id: number; xml: string }) => {
        return client.updateResource("customers", id, xml);
      },
    }),
    products_list: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.products_list.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.products_list.parameters,
      execute: async ({
        limit,
        reference,
        name,
        query,
      }: {
        limit: number;
        reference?: string;
        name?: string;
        query?: string;
      }) => {
        return client.listProducts({ limit, reference, name, query });
      },
    }),
    products_search: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.products_search.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.products_search.parameters,
      execute: async ({ limit, query }: { limit: number; query: string }) => {
        // Best-effort: do two searches (by reference and by name) and merge.
        const byRef = await client.listProducts({ limit, reference: query });
        const byName = await client.listProducts({ limit, name: query });

        const productsById = new Map<number, any>();
        const addProducts = (payload: any) => {
          const list = payload?.products;
          if (Array.isArray(list)) {
            for (const p of list) {
              if (p?.id !== undefined) productsById.set(Number(p.id), p);
            }
          }
        };
        addProducts(byRef);
        addProducts(byName);

        return { products: Array.from(productsById.values()) };
      },
    }),
    products_get: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.products_get.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.products_get.parameters,
      execute: async ({
        id,
        reference,
      }: {
        id?: number;
        reference?: string;
      }) => {
        if (id !== undefined) {
          return client.getProductById(id);
        }
        if (reference) {
          const result = await client.listProducts({ limit: 1, reference });
          return result;
        }
        return { error: "Either id or reference must be provided" };
      },
    }),
    products_delete: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.products_delete.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.products_delete.parameters,
      execute: async ({ id }: { id: number }) => {
        await client.deleteProduct(id);
        return { id, deleted: true };
      },
    }),
    products_create_xml: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.products_create_xml.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.products_create_xml.parameters,
      execute: async ({ xml }: { xml: string }) => {
        return client.createResource("products", xml);
      },
    }),
    products_update_xml: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.products_update_xml.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.products_update_xml.parameters,
      execute: async ({ id, xml }: { id: number; xml: string }) => {
        return client.updateResource("products", id, xml);
      },
    }),
    orders_list: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.orders_list.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.orders_list.parameters,
      execute: async ({
        limit,
        reference,
        customer_id,
      }: {
        limit: number;
        reference?: string;
        customer_id?: number;
      }) => {
        const result = await client.listOrders({
          limit,
          reference,
          customerId: customer_id,
        });
        return result;
      },
    }),
    orders_get: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.orders_get.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.orders_get.parameters,
      execute: async ({
        id,
        reference,
      }: {
        id?: number;
        reference?: string;
      }) => {
        if (id !== undefined) {
          return client.getOrderById(id);
        }
        if (reference) {
          const result = await client.listOrders({ limit: 1, reference });
          return result;
        }
        return { error: "Either id or reference must be provided" };
      },
    }),
    orders_delete: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.orders_delete.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.orders_delete.parameters,
      execute: async ({ id }: { id: number }) => {
        await client.deleteOrder(id);
        return { id, deleted: true };
      },
    }),
    orders_create_xml: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.orders_create_xml.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.orders_create_xml.parameters,
      execute: async ({ xml }: { xml: string }) => {
        return client.createResource("orders", xml);
      },
    }),
    orders_update_xml: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.orders_update_xml.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.orders_update_xml.parameters,
      execute: async ({ id, xml }: { id: number; xml: string }) => {
        return client.updateResource("orders", id, xml);
      },
    }),
    customer_threads_list: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customer_threads_list.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customer_threads_list.parameters,
      execute: async ({ limit }: { limit: number }) => {
        return client.listCustomerThreads({ limit });
      },
    }),
    customer_threads_get: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customer_threads_get.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customer_threads_get.parameters,
      execute: async ({ id }: { id: number }) => {
        return client.getCustomerThreadById(id);
      },
    }),
    customer_threads_delete: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.customer_threads_delete.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.customer_threads_delete.parameters,
      execute: async ({ id }: { id: number }) => {
        await client.deleteResource("customer_threads", id);
        return { id, deleted: true };
      },
    }),
    customer_threads_create_xml: tool({
      description:
        PRESTASHOP_TOOLS_SCHEMA.customer_threads_create_xml.description,
      inputSchema:
        PRESTASHOP_TOOLS_SCHEMA.customer_threads_create_xml.parameters,
      execute: async ({ xml }: { xml: string }) => {
        return client.createResource("customer_threads", xml);
      },
    }),
    customer_threads_update_xml: tool({
      description:
        PRESTASHOP_TOOLS_SCHEMA.customer_threads_update_xml.description,
      inputSchema:
        PRESTASHOP_TOOLS_SCHEMA.customer_threads_update_xml.parameters,
      execute: async ({ id, xml }: { id: number; xml: string }) => {
        return client.updateResource("customer_threads", id, xml);
      },
    }),
    customer_messages_create_xml: tool({
      description:
        PRESTASHOP_TOOLS_SCHEMA.customer_messages_create_xml.description,
      inputSchema:
        PRESTASHOP_TOOLS_SCHEMA.customer_messages_create_xml.parameters,
      execute: async ({ xml }: { xml: string }) => {
        return client.createResource("customer_messages", xml);
      },
    }),
    stock_list: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.stock_list.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.stock_list.parameters,
      execute: async ({
        limit,
        product_id,
        product_attribute_id,
      }: {
        limit: number;
        product_id?: number;
        product_attribute_id?: number;
      }) => {
        return client.listStockAvailables({
          id_product: product_id,
          id_product_attribute: product_attribute_id,
          limit,
        });
      },
    }),
    stock_update_quantity: tool({
      description: PRESTASHOP_TOOLS_SCHEMA.stock_update_quantity.description,
      inputSchema: PRESTASHOP_TOOLS_SCHEMA.stock_update_quantity.parameters,
      execute: async ({
        stock_available_id,
        quantity,
      }: {
        stock_available_id: number;
        quantity: number;
      }) => {
        return client.updateStockAvailableQuantity(
          stock_available_id,
          quantity,
        );
      },
    }),
  } as const;
};
