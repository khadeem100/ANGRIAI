import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { OdooClient } from "@/utils/odoo/client";
import prisma from "@/utils/prisma";
import { encryptToken } from "@/utils/encryption";
import { MCP_INTEGRATIONS } from "@/utils/mcp/integrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withEmailAccount("mcp/odoo/auth", async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  try {
    const body = await request.json();
    const { url, db, username, password } = body;

    if (!url || !db || !username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Verify connection
    const client = new OdooClient({
      url,
      db,
      username,
      password,
    });

    const uid = await client.connect();

    // 2. Encrypt password
    const encryptedPassword = encryptToken(password);
    if (!encryptedPassword) {
      throw new Error("Failed to encrypt credentials");
    }

    // 3. Find or create integration
    const integrationName = "odoo";
    const dbIntegration = await prisma.mcpIntegration.upsert({
      where: { name: integrationName },
      update: {},
      create: { name: integrationName },
    });

    // 4. Save connection
    await prisma.mcpConnection.upsert({
      where: {
        emailAccountId_integrationId: {
          emailAccountId,
          integrationId: dbIntegration.id,
        },
      },
      update: {
        accessToken: uid.toString(), // Store UID as access token for reference
        apiKey: encryptedPassword, // Store encrypted password/key
        metadata: {
          url,
          db,
          username,
          uid,
        },
        isActive: true,
      },
      create: {
        name: integrationName,
        emailAccountId,
        integrationId: dbIntegration.id,
        accessToken: uid.toString(),
        apiKey: encryptedPassword,
        metadata: {
          url,
          db,
          username,
          uid,
        },
        isActive: true,
      },
    });

    // 5. Sync tools immediately (fake sync since we know the tools)
    // We can't use syncMcpTools because it expects an external serverUrl to be reachable
    // So we manually insert the tools defined in MCP_INTEGRATIONS

    const integrationConfig = MCP_INTEGRATIONS[integrationName];
    const allowedTools = integrationConfig.allowedTools || [];

    const connection = await prisma.mcpConnection.findFirst({
      where: {
        emailAccountId,
        integrationId: dbIntegration.id,
      },
    });

    if (connection) {
      await prisma.mcpTool.deleteMany({
        where: { connectionId: connection.id },
      });

      await prisma.mcpTool.createMany({
        data: allowedTools.map((name) => ({
          connectionId: connection.id,
          name,
          description: `Odoo tool: ${name}`,
          isEnabled: true,
        })),
      });
    }

    return NextResponse.json({ success: true, uid });
  } catch (error) {
    console.error("Odoo connection error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to connect to Odoo",
      },
      { status: 500 },
    );
  }
});
