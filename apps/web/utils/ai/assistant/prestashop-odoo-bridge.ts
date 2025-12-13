import prisma from "@/utils/prisma";
import { decryptToken } from "@/utils/encryption";
import { PrestashopClient } from "@/utils/prestashop/client";
import { OdooClient } from "@/utils/odoo/client";
import { createScopedLogger } from "@/utils/logger";

export interface SyncPrestashopOrderToOdooParams {
  emailAccountId: string;
  prestashopOrderId?: number;
  prestashopOrderReference?: string;
  confirmOrder?: boolean;
}

export async function syncPrestashopOrderToOdoo({
  emailAccountId,
  prestashopOrderId,
  prestashopOrderReference,
  confirmOrder,
}: SyncPrestashopOrderToOdooParams) {
  const logger = createScopedLogger("prestashop-odoo-bridge").with({
    emailAccountId,
  });

  if (!prestashopOrderId && !prestashopOrderReference) {
    throw new Error(
      "You must provide either prestashopOrderId or prestashopOrderReference",
    );
  }

  // 1. Load PrestaShop and Odoo connections for this email account
  const [prestashopConn, odooConn] = await Promise.all([
    prisma.mcpConnection.findFirst({
      where: {
        emailAccountId,
        isActive: true,
        integration: { name: "prestashop" },
      },
      select: {
        apiKey: true,
        metadata: true,
      },
    }),
    prisma.mcpConnection.findFirst({
      where: {
        emailAccountId,
        isActive: true,
        integration: { name: "odoo" },
      },
      select: {
        apiKey: true,
        metadata: true,
      },
    }),
  ]);

  if (!prestashopConn) {
    throw new Error("PrestaShop is not connected for this account");
  }
  if (!odooConn) {
    throw new Error("Odoo is not connected for this account");
  }

  const psApiKey = decryptToken(prestashopConn.apiKey);
  const psMeta = (prestashopConn.metadata as any) || {};
  const psBaseUrl: string | undefined = psMeta.baseUrl;

  if (!psApiKey || !psBaseUrl) {
    throw new Error("Invalid PrestaShop connection configuration");
  }

  const odooPassword = decryptToken(odooConn.apiKey);
  const odooMeta = (odooConn.metadata as any) || {};
  const { url: odooUrl, db: odooDb, username: odooUser } = odooMeta;

  if (!odooUrl || !odooDb || !odooUser || !odooPassword) {
    throw new Error("Invalid Odoo connection configuration");
  }

  const prestashop = new PrestashopClient({
    baseUrl: psBaseUrl,
    apiKey: psApiKey,
  });
  const odoo = new OdooClient({
    url: odooUrl,
    db: odooDb,
    username: odooUser,
    password: odooPassword,
  });

  // 2. Fetch order from PrestaShop
  let order: any | null = null;

  if (prestashopOrderId) {
    const raw = await prestashop.getOrderById(prestashopOrderId);
    order = normalizePrestashopOrder(raw);
  } else if (prestashopOrderReference) {
    const raw = await prestashop.listOrders({
      limit: 1,
      reference: prestashopOrderReference,
    });
    order = normalizePrestashopOrder(raw);
  }

  if (!order) {
    throw new Error("Could not find the specified PrestaShop order");
  }

  const reference: string | undefined = order.reference;
  const prestashopOrderIdFinal: number | undefined = order.id
    ? Number(order.id)
    : undefined;

  if (!reference) {
    logger.warn("PrestaShop order has no reference", { order });
  }

  // 3. Ensure customer exists in Odoo (create if needed)
  const customerId = await ensureOdooCustomerForPrestashopOrder({
    order,
    prestashop,
    odoo,
    logger,
  });

  // 4. Build Odoo sale order lines from PrestaShop order rows
  const orderLines = await buildOdooOrderLinesFromPrestashopOrder({
    order,
    odoo,
    logger,
  });

  // 5. Check if an Odoo order already exists for this PrestaShop reference to avoid duplicates
  let existingOrder: any | null = null;
  if (reference) {
    const found = await odoo.searchRead(
      "sale.order",
      [["client_order_ref", "=", reference]],
      ["id", "name", "state", "amount_total"],
      1,
    );
    if (Array.isArray(found) && found.length > 0) {
      existingOrder = found[0];
    }
  }

  if (existingOrder) {
    return {
      status: "already_exists" as const,
      prestashopOrderId: prestashopOrderIdFinal,
      prestashopReference: reference,
      odooOrderId: existingOrder.id,
      odooOrderName: existingOrder.name,
      message:
        "Odoo sale order already exists for this PrestaShop reference (client_order_ref). No new order was created.",
    };
  }

  // 6. Create Odoo sale order
  const orderLineCommands = orderLines.map((vals) => [0, 0, vals]);

  const saleOrderValues: any = {
    partner_id: customerId,
    order_line: orderLineCommands,
  };

  if (reference) {
    saleOrderValues.client_order_ref = reference;
  }

  const odooOrderId: number = await odoo.create("sale.order", saleOrderValues);

  if (confirmOrder) {
    try {
      await odoo.execute("sale.order", "action_confirm", [[odooOrderId]]);
    } catch (error) {
      logger.warn("Failed to confirm Odoo sale order", {
        error: error instanceof Error ? error.message : String(error),
        odooOrderId,
      });
    }
  }

  return {
    status: "created" as const,
    prestashopOrderId: prestashopOrderIdFinal,
    prestashopReference: reference,
    odooOrderId,
    customerId,
    lineCount: orderLines.length,
    confirmed: !!confirmOrder,
  };
}

async function ensureOdooCustomerForPrestashopOrder({
  order,
  prestashop,
  odoo,
  logger,
}: {
  order: any;
  prestashop: PrestashopClient;
  odoo: OdooClient;
  logger: ReturnType<typeof createScopedLogger>;
}): Promise<number> {
  const customerIdStr = order.id_customer ?? order.id_customer_default;
  if (!customerIdStr) {
    throw new Error("PrestaShop order is missing id_customer");
  }

  const customerIdNum = Number(customerIdStr);
  const rawCustomer = await prestashop.getCustomerById(customerIdNum);
  const customer = normalizePrestashopCustomer(rawCustomer);

  const email: string | undefined = customer.email;
  const firstName: string | undefined = customer.firstname;
  const lastName: string | undefined = customer.lastname;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    email ||
    "PrestaShop customer";

  // Try to find existing partner by email or name
  const domain: any[] = [];
  if (email) {
    domain.push("|");
    domain.push(["email", "ilike", email]);
    domain.push(["name", "ilike", fullName]);
  } else {
    domain.push(["name", "ilike", fullName]);
  }

  const existing = await odoo.searchRead(
    "res.partner",
    domain,
    ["id", "name", "email"],
    1,
  );

  if (Array.isArray(existing) && existing.length > 0) {
    return existing[0].id as number;
  }

  // Create new partner in Odoo
  const partnerValues: any = {
    name: fullName,
  };
  if (email) partnerValues.email = email;

  const newPartnerId = await odoo.create("res.partner", partnerValues);
  logger.info("Created new Odoo customer from PrestaShop order", {
    partnerId: newPartnerId,
    email,
    name: fullName,
  });

  return newPartnerId as number;
}

async function buildOdooOrderLinesFromPrestashopOrder({
  order,
  odoo,
  logger,
}: {
  order: any;
  odoo: OdooClient;
  logger: ReturnType<typeof createScopedLogger>;
}): Promise<Array<Record<string, any>>> {
  const associations = order.associations || order._associations || {};
  const rowsContainer = associations.order_rows || associations.order_row || {};

  let rows: any[] = [];
  if (Array.isArray(rowsContainer)) {
    rows = rowsContainer;
  } else if (Array.isArray(rowsContainer.order_row)) {
    rows = rowsContainer.order_row;
  }

  if (!rows || rows.length === 0) {
    logger.warn("PrestaShop order has no order rows", { orderId: order.id });
    return [];
  }

  const lineValues: Array<Record<string, any>> = [];

  for (const row of rows) {
    const productIdStr = row.product_id;
    const productRef: string | undefined = row.product_reference;
    const productName: string | undefined = row.product_name;
    const quantity =
      Number(row.product_quantity ?? row.product_quantity_in_stock ?? 1) || 1;
    const unitPrice = Number(
      row.unit_price_tax_excl ??
        row.unit_price_tax_incl ??
        row.original_product_price ??
        0,
    );

    let odooProductId: number | null = null;

    // Try to find product by reference (default_code) first
    if (productRef) {
      const foundByRef = await odoo.searchRead(
        "product.product",
        [["default_code", "ilike", productRef]],
        ["id", "name", "default_code"],
        1,
      );
      if (Array.isArray(foundByRef) && foundByRef.length > 0) {
        odooProductId = foundByRef[0].id as number;
      }
    }

    // Fallback: search by name
    if (!odooProductId && productName) {
      const foundByName = await odoo.searchRead(
        "product.product",
        [["name", "ilike", productName]],
        ["id", "name", "default_code"],
        1,
      );
      if (Array.isArray(foundByName) && foundByName.length > 0) {
        odooProductId = foundByName[0].id as number;
      }
    }

    // If still not found, optionally create a simple product
    if (!odooProductId && (productRef || productName)) {
      const values: any = {
        name: productName || productRef || "PrestaShop product",
      };
      if (productRef) values.default_code = productRef;
      if (unitPrice > 0) values.list_price = unitPrice;

      try {
        const newProductId = await odoo.create("product.product", values);
        odooProductId = newProductId as number;
        logger.info("Created new Odoo product from PrestaShop order line", {
          productId: odooProductId,
          name: values.name,
          default_code: values.default_code,
        });
      } catch (error) {
        logger.warn(
          "Failed to create Odoo product from PrestaShop order line",
          {
            error: error instanceof Error ? error.message : String(error),
            productRef,
            productName,
          },
        );
      }
    }

    const vals: any = {
      product_uom_qty: quantity,
    };

    if (odooProductId) {
      vals.product_id = odooProductId;
    }
    if (unitPrice > 0) {
      vals.price_unit = unitPrice;
    }
    if (!odooProductId && productName) {
      vals.name = productName;
    }

    lineValues.push(vals);
  }

  return lineValues;
}

function normalizePrestashopOrder(raw: any): any | null {
  if (!raw) return null;
  if (raw.order) return raw.order;
  if (Array.isArray(raw.orders) && raw.orders.length > 0) return raw.orders[0];
  if (raw.orders && raw.orders.order) return raw.orders.order;
  return raw;
}

function normalizePrestashopCustomer(raw: any): any {
  if (!raw) return {};
  if (raw.customer) return raw.customer;
  if (Array.isArray(raw.customers) && raw.customers.length > 0)
    return raw.customers[0];
  if (raw.customers && raw.customers.customer) return raw.customers.customer;
  return raw;
}
