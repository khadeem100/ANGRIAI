import { env } from "@/env";

type McpIntegrationConfig = {
  name: string;
  serverUrl?: string;
  authType: "oauth" | "api-token";
  scopes: string[];
};

export const MCP_INTEGRATIONS: Record<
  string,
  McpIntegrationConfig & {
    displayName: string;
    allowedTools?: string[];
    comingSoon?: boolean;
    oauthConfig?: {
      authorization_endpoint: string;
      token_endpoint: string;
      registration_endpoint?: string;
    };
    logo?: string;
    description?: string;
    category?: string;
    features?: string[];
    pricing?: {
      amount: number; // Amount in cents
      currency: string;
      stripePriceId?: string; // Optional: for recurring subscriptions
    };
    isFree?: boolean; // Default is true if pricing is not set
  }
> = {
  notion: {
    name: "notion",
    displayName: "Notion",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    description:
      "Connect your Notion workspace to search and fetch content directly from your emails. Access your notes, databases, and pages seamlessly.",
    category: "Productivity",
    features: [
      "Search across all your Notion pages",
      "Fetch page content and metadata",
      "Access databases and properties",
      "Real-time workspace sync",
    ],
    serverUrl: "https://mcp.notion.com/mcp",
    authType: "oauth",
    scopes: ["read"],
    allowedTools: ["notion-search", "notion-fetch"],
    // OAuth endpoints auto-discovered via RFC 8414/9728
  },
  monday: {
    name: "monday",
    displayName: "Monday.com",
    logo: "https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/img/monday-logo-x2.png",
    description:
      "Integrate Monday.com project management to track boards, items, workspaces, and collaborate with your team directly from your inbox.",
    category: "Project Management",
    features: [
      "Access board items and info",
      "View workspace details",
      "List all workspaces",
      "Search and filter items",
      "Real-time board updates",
    ],
    serverUrl: "https://mcp.monday.com/mcp",
    authType: "oauth",
    scopes: ["read", "write"],
    allowedTools: ["monday-search", "monday-fetch"],
    // OAuth endpoints auto-discovered via RFC 8414/9728
  },
  quickbooks: {
    name: "quickbooks",
    displayName: "QuickBooks",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/QuickBooks_Logo.svg/1200px-QuickBooks_Logo.svg.png",
    description:
      "Connect QuickBooks accounting to manage customers, invoices, payments, and track financial data directly from your inbox.",
    category: "Accounting",
    features: [
      "Manage customers and vendors",
      "Create and track invoices",
      "Handle payments and refunds",
      "Track financial reports",
      "Access product catalog",
    ],
    serverUrl: "https://mcp.quickbooks.com",
    authType: "oauth",
    scopes: ["read", "write"],
    allowedTools: [
      "list_customers",
      "list_invoices",
      "list_payments",
      "list_products",
      "list_vendors",
    ],
    oauthConfig: {
      authorization_endpoint: "https://appcenter.intuit.com/connect/oauth2",
      token_endpoint:
        "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    },
    pricing: {
      amount: 2999, // $29.99
      currency: "usd",
    },
  },
  stripe: {
    name: "stripe",
    displayName: "Stripe",
    logo: "https://images.ctfassets.net/fzn2n1nzq965/3AGidihOJl4nH9D1vDjM84/9540155d584be52fc54c443b6efa4ae6/stripe.png",
    description:
      "Integrate Stripe payment processing to manage customers, invoices, subscriptions, and payment data directly from your inbox.",
    category: "Payments",
    features: [
      "View and manage customers",
      "Track invoices and payments",
      "Monitor subscriptions",
      "Handle disputes and refunds",
      "Access product catalog",
    ],
    serverUrl: "https://mcp.stripe.com",
    authType: "oauth", // must request whitelisting of /api/mcp/stripe/callback from Stripe. localhost is whitelisted already.
    // authType: "api-token", // alternatively, use an API token.
    scopes: [],
    allowedTools: [
      "list_customers",
      "list_disputes",
      "list_invoices",
      "list_payment_intents",
      "list_prices",
      "list_products",
      "list_subscriptions",
      // "search_stripe_resources",
    ],
    // OAuth endpoints auto-discovered via RFC 8414/9728
  },
  odoo: {
    name: "odoo",
    displayName: "Odoo",
    logo: "https://www.odoo.com/web/image/website/1/logo/Odoo?unique=6b3b9e1",
    description:
      "Connect Odoo ERP to manage CRM leads, sales orders, invoices, projects, helpdesk tickets, and inventory from your inbox.",
    category: "ERP",
    features: [
      "Manage CRM leads and partners",
      "Create and track sales orders",
      "Handle invoices and payments",
      "Track project tasks",
      "Manage helpdesk tickets",
      "Update product inventory",
    ],
    serverUrl: `${env.NEXT_PUBLIC_BASE_URL}/api/mcp/odoo`,
    authType: "api-token",
    scopes: ["read", "write"],
    allowedTools: [
      "customers_list",
      "customers_search",
      "customers_get",
      "customers_delete",
      "customers_create_xml",
      "customers_update_xml",
      "orders_list",
      "orders_get",
      "orders_delete",
      "orders_create_xml",
      "orders_update_xml",
      "projects_list",
      "projects_get",
      "projects_delete",
      "projects_create_xml",
      "projects_update_xml",
      "helpdesk_list",
      "helpdesk_get",
      "helpdesk_delete",
      "helpdesk_create_xml",
      "helpdesk_update_xml",
      "stock_list",
      "stock_update_quantity",
    ],
  },
  prestashop: {
    name: "prestashop",
    displayName: "PrestaShop",
    logo: "https://www.prestashop.com/sites/all/themes/prestashop/images/logo.png",
    description:
      "Connect your PrestaShop e-commerce store to manage products, orders, customers, and inventory directly from your email workflow.",
    category: "E-commerce",
    features: [
      "Manage products and inventory",
      "Process orders and track status",
      "Handle customer inquiries",
      "Update stock levels",
      "View customer threads and messages",
    ],
    serverUrl: "",
    authType: "api-token",
    scopes: ["read", "write"],
    allowedTools: [
      "customers_list",
      "customers_search",
      "customers_get",
      "customers_delete",
      "customers_create_xml",
      "customers_update_xml",
      "products_list",
      "products_search",
      "products_get",
      "products_delete",
      "products_create_xml",
      "products_update_xml",
      "orders_list",
      "orders_get",
      "orders_delete",
      "orders_create_xml",
      "orders_update_xml",
      "customer_threads_list",
      "customer_threads_get",
      "customer_threads_delete",
      "customer_threads_create_xml",
      "customer_threads_update_xml",
      "customer_messages_create_xml",
      "stock_list",
      "stock_update_quantity",
    ],
    comingSoon: false,
  },
  hubspot: {
    name: "hubspot",
    displayName: "HubSpot",
    logo: "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
    description:
      "Connect HubSpot CRM to manage contacts, companies, deals, and marketing campaigns directly from your email workflow.",
    category: "CRM",
    features: [
      "Manage contacts and companies",
      "Track deals and pipelines",
      "Access marketing content",
      "Create and update forms",
      "View timeline activities",
    ],
    serverUrl: "https://mcp.hubspot.com/",
    authType: "oauth",
    scopes: [
      // "crm.objects.contacts.read",
      // "crm.objects.companies.read",
      // "crm.objects.deals.read",
      // "crm.objects.carts.read",
      // "crm.objects.products.read",
      // "crm.objects.orders.read",
      // "crm.objects.line_items.read",
      // "crm.objects.invoices.read",
      // "crm.objects.quotes.read",
      // "crm.objects.subscriptions.read",
      // "crm.objects.users.read",
      // "crm.objects.owners.read",
      "content",
      "crm.objects.companies.read",
      "crm.objects.companies.write",
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.deals.write",
      "forms",
      "oauth",
      "timeline",
    ],
    oauthConfig: {
      // authorization_endpoint: "https://mcp.hubspot.com/oauth/authorize/user",
      authorization_endpoint: "https://app.hubspot.com/oauth/authorize",
      token_endpoint: "https://mcp.hubspot.com/oauth/v1/token",
    },
    pricing: {
      amount: 4999, // $49.99
      currency: "usd",
    },
    comingSoon: true,
  },
  // clickup: {
  //   name: "clickup",
  //   displayName: "ClickUp",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
  // airtable: {
  //   name: "airtable",
  //   displayName: "Airtable",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
  // salesforce: {
  //   name: "salesforce",
  //   displayName: "Salesforce",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
  // todoist: {
  //   name: "todoist",
  //   displayName: "Todoist",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
};

export type IntegrationKey = keyof typeof MCP_INTEGRATIONS;

export function getIntegration(
  name: string,
): (typeof MCP_INTEGRATIONS)[IntegrationKey] {
  const integration = MCP_INTEGRATIONS[name];
  if (!integration) {
    throw new Error(`Unknown MCP integration: ${name}`);
  }
  return integration;
}

export function getStaticCredentials(
  integration: IntegrationKey,
): { clientId?: string; clientSecret?: string } | undefined {
  switch (integration) {
    case "quickbooks":
      return {
        clientId: env.QUICKBOOKS_CLIENT_ID,
        clientSecret: env.QUICKBOOKS_CLIENT_SECRET,
      };
    // case "hubspot":
    //   return {
    //     clientId: env.HUBSPOT_MCP_CLIENT_ID,
    //     clientSecret: env.HUBSPOT_MCP_CLIENT_SECRET,
    //   };
    default:
      return undefined;
  }
}
