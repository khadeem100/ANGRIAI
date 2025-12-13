import { createScopedLogger } from "@/utils/logger";
import { XMLBuilder } from "fast-xml-parser";

export interface PrestashopClientConfig {
  baseUrl: string;
  apiKey: string;
}

export class PrestashopClient {
  private baseUrl: string;
  private apiKey: string;
  private logger = createScopedLogger("prestashop-client");

  constructor({ baseUrl, apiKey }: PrestashopClientConfig) {
    // Normalize base URL so callers can pass either the shop URL
    // (e.g. https://shop.example.com or https://shop.example.com/shop)
    // or the Webservice URL (e.g. https://shop.example.com/api or /shop/api).
    // We always strip a trailing "/api" segment and then add "/api" ourselves
    // when building requests. This avoids ".../api/api/..." issues.
    const url = new URL(baseUrl);
    let pathname = url.pathname.replace(/\/+$/, "");
    if (pathname.toLowerCase().endsWith("/api")) {
      pathname = pathname.slice(0, -4) || "/";
    }
    url.pathname = pathname || "/";

    this.baseUrl = url.toString().replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private buildUrl(
    path: string,
    searchParams?: Record<string, string | number | undefined>,
  ): string {
    const cleanedPath = path.replace(/^\/+/, "");
    const url = new URL(`${this.baseUrl}/api/${cleanedPath}`);
    url.searchParams.set("ws_key", this.apiKey);
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private async requestJson<T>(
    path: string,
    init?: RequestInit,
    searchParams?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = this.buildUrl(path, searchParams);

    const res = await fetch(url, {
      ...init,
      headers: {
        "Output-Format": "JSON",
        Accept: "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.logger.error("PrestaShop API error", {
        status: res.status,
        body: text,
        path,
        url: url.toString().split("?")[0],
      });
      throw new Error(text || `PrestaShop API error ${res.status}`);
    }

    if (res.status === 204) {
      return undefined as unknown as T;
    }

    return (await res.json()) as T;
  }

  private async requestXml<T = any>(
    path: string,
    method: "POST" | "PUT" | "DELETE",
    xmlBody?: string,
  ): Promise<T> {
    const url = this.buildUrl(path);

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/xml",
        "Output-Format": "JSON",
        Accept: "application/json",
      },
      body: xmlBody,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.logger.error("PrestaShop API error", {
        status: res.status,
        body: text,
        path,
        method,
      });
      throw new Error(text || `PrestaShop API error ${res.status}`);
    }

    if (res.status === 204) {
      return undefined as unknown as T;
    }

    try {
      return (await res.json()) as T;
    } catch {
      return undefined as unknown as T;
    }
  }

  async ping(): Promise<void> {
    // Simple sanity check: fetch a small page of customers.
    // This verifies that the Webservice is enabled and the key has access.
    await this.requestJson("customers", { method: "GET" }, { limit: 1 });
  }

  // Generic helpers for specific resources (JSON reads)

  async listCustomers(
    params: {
      limit?: number;
      email?: string;
      name?: string;
      firstname?: string;
      lastname?: string;
      query?: string;
    } = {},
  ): Promise<any> {
    const search: Record<string, string> = { display: "full" };
    if (params.limit !== undefined) {
      search.limit = String(params.limit);
    }
    if (params.email) {
      // PrestaShop filter syntax: filter[field]=[value]
      search["filter[email]"] = `[${params.email}]`;
    }

    const firstname = params.firstname ?? params.name;
    if (firstname) {
      search["filter[firstname]"] = `%[${firstname}]%`;
    }
    if (params.lastname) {
      search["filter[lastname]"] = `%[${params.lastname}]%`;
    }

    // NOTE: PrestaShop webservice filtering does not support OR across multiple fields.
    // `query` here is a best-effort convenience; callers can do multiple searches and merge.
    if (params.query) {
      search["filter[firstname]"] = `%[${params.query}]%`;
    }

    return this.requestJson("customers", { method: "GET" }, search);
  }

  async getCustomerById(id: number): Promise<any> {
    return this.requestJson(`customers/${id}`, { method: "GET" });
  }

  async getCustomerByEmail(email: string): Promise<any> {
    return this.listCustomers({ email, limit: 1 });
  }

  async listAddresses(
    params: {
      limit?: number;
      id_customer?: number;
      company?: string;
      phone?: string;
      phone_mobile?: string;
    } = {},
  ): Promise<any> {
    const search: Record<string, string> = { display: "full" };
    if (params.limit !== undefined) {
      search.limit = String(params.limit);
    }
    if (params.id_customer !== undefined) {
      search["filter[id_customer]"] = `[${params.id_customer}]`;
    }
    if (params.company) {
      search["filter[company]"] = `%[${params.company}]%`;
    }
    if (params.phone) {
      search["filter[phone]"] = `%[${params.phone}]%`;
    }
    if (params.phone_mobile) {
      search["filter[phone_mobile]"] = `%[${params.phone_mobile}]%`;
    }
    return this.requestJson("addresses", { method: "GET" }, search);
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.requestXml(`customers/${id}`, "DELETE");
  }

  async listProducts(
    params: {
      limit?: number;
      reference?: string;
      name?: string;
      query?: string;
    } = {},
  ): Promise<any> {
    const search: Record<string, string> = { display: "full" };
    if (params.limit !== undefined) {
      search.limit = String(params.limit);
    }
    if (params.reference) {
      search["filter[reference]"] = `%[${params.reference}]%`;
    }

    const name = params.name ?? params.query;
    if (name) {
      // PrestaShop exposes a `name` field in the product resource; depending on configuration
      // this may or may not be filterable. When it is, partial matching works with %[x]%.
      search["filter[name]"] = `%[${name}]%`;
    }

    return this.requestJson("products", { method: "GET" }, search);
  }

  async getProductById(id: number): Promise<any> {
    return this.requestJson(`products/${id}`, { method: "GET" });
  }

  async deleteProduct(id: number): Promise<void> {
    await this.requestXml(`products/${id}`, "DELETE");
  }

  async listOrders(
    params: { limit?: number; reference?: string; customerId?: number } = {},
  ): Promise<any> {
    const search: Record<string, string> = { display: "full" };
    if (params.limit !== undefined) {
      search.limit = String(params.limit);
    }
    if (params.reference) {
      search["filter[reference]"] = `[${params.reference}]`;
    }
    if (params.customerId !== undefined) {
      search["filter[id_customer]"] = `[${params.customerId}]`;
    }
    return this.requestJson("orders", { method: "GET" }, search);
  }

  async getOrderById(id: number): Promise<any> {
    return this.requestJson(`orders/${id}`, { method: "GET" });
  }

  async deleteOrder(id: number): Promise<void> {
    await this.requestXml(`orders/${id}`, "DELETE");
  }

  async listCustomerThreads(params: { limit?: number } = {}): Promise<any> {
    const search: Record<string, string> = { display: "full" };
    if (params.limit !== undefined) {
      search.limit = String(params.limit);
    }
    return this.requestJson("customer_threads", { method: "GET" }, search);
  }

  async getCustomerThreadById(id: number): Promise<any> {
    return this.requestJson(`customer_threads/${id}`, { method: "GET" });
  }

  async listStockAvailables(
    params: {
      id_product?: number;
      id_product_attribute?: number;
      limit?: number;
    } = {},
  ): Promise<any> {
    const search: Record<string, string> = { display: "full" };
    if (params.id_product !== undefined) {
      search["filter[id_product]"] = `[${params.id_product}]`;
    }
    if (params.id_product_attribute !== undefined) {
      search["filter[id_product_attribute]"] =
        `[${params.id_product_attribute}]`;
    }
    if (params.limit !== undefined) {
      search.limit = String(params.limit);
    }
    return this.requestJson("stock_availables", { method: "GET" }, search);
  }

  async getStockAvailableById(id: number): Promise<any> {
    return this.requestJson(`stock_availables/${id}`, { method: "GET" });
  }

  async updateStockAvailableQuantity(
    id: number,
    quantity: number,
  ): Promise<any> {
    const current = await this.getStockAvailableById(id);
    const stock = (current as any).stock_available ?? current;

    // Clone to avoid mutating the original object
    const updated = { ...stock, quantity };

    const builder = new XMLBuilder({ ignoreAttributes: false, format: false });
    const xmlBody = builder.build({ prestashop: { stock_available: updated } });

    return this.requestXml(`stock_availables/${id}`, "PUT", xmlBody);
  }

  // Generic XML-based mutating operations (create/update for any resource)

  async createResource(resource: string, xmlBody: string): Promise<any> {
    return this.requestXml(resource, "POST", xmlBody);
  }

  async updateResource(
    resource: string,
    id: number,
    xmlBody: string,
  ): Promise<any> {
    return this.requestXml(`${resource}/${id}`, "PUT", xmlBody);
  }

  async deleteResource(resource: string, id: number): Promise<void> {
    await this.requestXml(`${resource}/${id}`, "DELETE");
  }
}
