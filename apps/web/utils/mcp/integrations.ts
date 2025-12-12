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
  }
> = {
  notion: {
    name: "notion",
    displayName: "Notion",
    serverUrl: "https://mcp.notion.com/mcp",
    authType: "oauth",
    scopes: ["read"],
    allowedTools: ["notion-search", "notion-fetch"],
    // OAuth endpoints auto-discovered via RFC 8414/9728
  },
  stripe: {
    name: "stripe",
    displayName: "Stripe",
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
  monday: {
    name: "monday",
    displayName: "Monday.com",
    serverUrl: "https://mcp.monday.com/mcp",
    authType: "oauth",
    scopes: ["read", "write"],
    allowedTools: [
      "get_board_items_by_name",
      // "create_item",
      // "create_update",
      // "get_board_activity",
      "get_board_info",
      // "list_users_and_teams",
      // "create_board",
      // "create_form",
      // "update_form",
      // "get_form",
      // "form_questions_editor",
      // "create_column",
      // "create_group",
      // "all_monday_api",
      // "get_graphql_schema",
      // "get_column_type_info",
      // "get_type_details",
      // "read_docs",
      "workspace_info",
      "list_workspaces",
      // "create_doc",
      // "update_workspace",
      // "update_folder",
      // "create_workspace",
      // "create_folder",
      // "move_object",
      // "create_dashboard",
      // "all_widgets_schema",
      // "create_widget",
    ],
    // OAuth endpoints auto-discovered via RFC 8414
    comingSoon: false,
  },
  prestashop: {
    name: "prestashop",
    displayName: "PrestaShop",
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
    comingSoon: true,
  },
  quickbooks: {
    name: "quickbooks",
    displayName: "QuickBooks",
    // OAuth resource server (not an MCP server)
    serverUrl: "https://quickbooks.api.intuit.com",
    authType: "oauth",
    scopes: ["com.intuit.quickbooks.accounting"],
    allowedTools: [
      "customer_list",
      "invoice_list",
      "invoice_create",
    ],
    // QuickBooks does not expose RFC discovery, so we provide static endpoints
    oauthConfig: {
      authorization_endpoint: "https://appcenter.intuit.com/connect/oauth2",
      token_endpoint: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    },
    comingSoon: false,
  },
  odoo: {
    name: "odoo",
    displayName: "Odoo",
    serverUrl: `${env.NEXT_PUBLIC_BASE_URL}/api/mcp/odoo`,
    authType: "api-token",
    scopes: ["read", "write"],
    allowedTools: [
      "crm_lead_list",
      "crm_lead_create",
      "res_partner_list",
      "res_partner_search",
      "project_task_list",
      "project_task_create",
      "helpdesk_ticket_list",
      "sale_order_list",
      "sale_order_create",
      "sale_order_confirm",
      "sale_order_detail",
      "invoice_list",
      "invoice_create",
      "invoice_post",
      "invoice_detail",
      "product_list",
      "product_search",
      "product_update_stock",
    ],
    comingSoon: false,
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
