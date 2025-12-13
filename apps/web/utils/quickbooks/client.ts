import { createScopedLogger } from "@/utils/logger";

export class QuickBooksClient {
  private accessToken: string;
  private realmId: string;
  private baseUrl: string;
  private logger = createScopedLogger("quickbooks-client");

  constructor({
    accessToken,
    realmId,
    baseUrl = "https://quickbooks.api.intuit.com",
  }: {
    accessToken: string;
    realmId: string;
    baseUrl?: string;
  }) {
    this.accessToken = accessToken;
    this.realmId = realmId;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      this.logger.error("QuickBooks API error", {
        status: res.status,
        body: text,
        path,
      });
      throw new Error(text || `QuickBooks API error ${res.status}`);
    }

    // Some endpoints return no body
    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as T;
  }

  async query<T = any>(q: string, minorVersion = 65): Promise<T> {
    const path = `/v3/company/${this.realmId}/query?minorversion=${minorVersion}&query=${encodeURIComponent(q)}`;
    return this.request<T>(path, { method: "GET" });
  }

  async createInvoice(payload: any, minorVersion = 65): Promise<any> {
    const path = `/v3/company/${this.realmId}/invoice?minorversion=${minorVersion}`;
    return this.request<any>(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async createCustomer(payload: any, minorVersion = 65): Promise<any> {
    const path = `/v3/company/${this.realmId}/customer?minorversion=${minorVersion}`;
    return this.request<any>(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
