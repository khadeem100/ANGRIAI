import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { MCP_INTEGRATIONS } from "@/utils/mcp/integrations";
import { syncMcpTools } from "@/utils/mcp/sync-tools";
import prisma from "@/utils/prisma";

export type GetIntegrationsResponse = Awaited<ReturnType<typeof getData>>;

export const GET = withEmailAccount("mcp/integrations", async (request) => {
  const emailAccountId = request.auth.emailAccountId;
  return NextResponse.json(await getData(emailAccountId));
});

async function getData(emailAccountId: string) {
  // Best-effort: ensure Odoo tools are synced so UI reflects latest toolset
  try {
    const activeOdoo = await prisma.mcpConnection.findFirst({
      where: { emailAccountId, isActive: true, integration: { name: "odoo" } },
      select: { id: true },
    });
    if (activeOdoo) {
      await syncMcpTools("odoo", emailAccountId);
    }
  } catch {}

  // Best-effort: ensure PrestaShop tools are synced as well
  try {
    const activePrestashop = await prisma.mcpConnection.findFirst({
      where: { emailAccountId, isActive: true, integration: { name: "prestashop" } },
      select: { id: true },
    });
    if (activePrestashop) {
      await syncMcpTools("prestashop", emailAccountId);
    }
  } catch {}

  const connections = await prisma.mcpConnection.findMany({
    where: { emailAccountId },
    select: {
      id: true,
      name: true,
      isActive: true,
      integration: { select: { id: true, name: true } },
      tools: {
        select: { id: true, name: true, description: true, isEnabled: true },
      },
    },
  });

  const integrations = Object.values(MCP_INTEGRATIONS).map((integration) => ({
    name: integration.name,
    displayName: integration.displayName,
    comingSoon: integration.comingSoon,
    authType: integration.authType,
    connection: connections.find(
      (connection) => connection.integration.name === integration.name,
    ),
  }));

  return { integrations };
}
