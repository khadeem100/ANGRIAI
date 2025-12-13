import xmlrpc from "xmlrpc";

export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password?: string;
  apiKey?: string; // Odoo API key can be used instead of password
}

export class OdooClient {
  private config: OdooConfig;
  private common: xmlrpc.Client;
  private object: xmlrpc.Client;
  private uid: number | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
    const url = new URL(config.url);
    const clientOptions = {
      host: url.hostname,
      port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
      path: "/xmlrpc/2/common",
      headers: {
        "User-Agent": "InboxZero-Odoo/1.0",
      },
    };

    const isSecure = url.protocol === "https:";
    const createClient = isSecure
      ? xmlrpc.createSecureClient
      : xmlrpc.createClient;

    this.common = createClient(clientOptions);
    this.object = createClient({
      ...clientOptions,
      path: "/xmlrpc/2/object",
    });
  }

  async connect(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.common.methodCall(
        "authenticate",
        [
          this.config.db,
          this.config.username,
          this.config.password || this.config.apiKey,
          {},
        ],
        (error, value) => {
          if (error) {
            reject(error);
          } else if (value === false) {
            reject(new Error("Authentication failed"));
          } else {
            this.uid = Number(value);
            resolve(this.uid);
          }
        },
      );
    });
  }

  async execute(
    model: string,
    method: string,
    args: any[] = [],
    kwargs: any = {},
  ): Promise<any> {
    if (!this.uid) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.object.methodCall(
        "execute_kw",
        [
          this.config.db,
          this.uid,
          this.config.password || this.config.apiKey,
          model,
          method,
          args,
          kwargs,
        ],
        (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        },
      );
    });
  }

  // Helper methods for common operations

  async searchRead(
    model: string,
    domain: any[] = [],
    fields: string[] = [],
    limit = 10,
  ) {
    return this.execute(model, "search_read", [domain], {
      fields,
      limit,
    });
  }

  async create(model: string, values: any) {
    return this.execute(model, "create", [values]);
  }

  async update(model: string, ids: number[], values: any) {
    return this.execute(model, "write", [ids, values]);
  }
}
