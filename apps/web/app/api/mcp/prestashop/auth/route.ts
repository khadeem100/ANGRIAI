import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import prisma from "@/utils/prisma";
import { encryptToken } from "@/utils/encryption";
import { PrestashopClient } from "@/utils/prestashop/client";
import { syncMcpTools } from "@/utils/mcp/sync-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeBaseUrl(input: string): string {
  const trimmed = String(input).trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withScheme).toString();
}

export const POST = withEmailAccount("mcp/prestashop/auth", async (request) => {
  const emailAccountId = request.auth.emailAccountId;

  try {
    const body = await request.json();
    const { baseUrl, apiKey } = body as {
      baseUrl?: string;
      apiKey?: string;
    };

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: baseUrl and apiKey" },
        { status: 400 },
      );
    }

    let normalizedBaseUrl: string;
    try {
      normalizedBaseUrl = normalizeBaseUrl(baseUrl);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid baseUrl. Please enter a valid shop URL like https://gato.nl (do not include /api).",
        },
        { status: 400 },
      );
    }

    // 1. Verify connection by hitting the resources endpoint
    const client = new PrestashopClient({ baseUrl: normalizedBaseUrl, apiKey });
    await client.ping();

    // 2. Encrypt API key
    const encryptedKey = encryptToken(apiKey);
    if (!encryptedKey) {
      throw new Error("Failed to encrypt API key");
    }

    // 3. Find or create integration
    const integrationName = "prestashop";
    const dbIntegration = await prisma.mcpIntegration.upsert({
      where: { name: integrationName },
      update: {},
      create: { name: integrationName },
    });

    // 4. Save connection (upsert for this email account)
    const connection = await prisma.mcpConnection.upsert({
      where: {
        emailAccountId_integrationId: {
          emailAccountId,
          integrationId: dbIntegration.id,
        },
      },
      update: {
        apiKey: encryptedKey,
        metadata: {
          baseUrl: normalizedBaseUrl,
        },
        isActive: true,
      },
      create: {
        name: integrationName,
        emailAccountId,
        integrationId: dbIntegration.id,
        apiKey: encryptedKey,
        metadata: {
          baseUrl: normalizedBaseUrl,
        },
        isActive: true,
      },
    });

    // 5. Sync tools so they appear in the UI and are available to the AI
    try {
      await syncMcpTools("prestashop", emailAccountId);
    } catch (error) {
      console.error("Failed to sync PrestaShop tools after auth:", error);
    }

    return NextResponse.json({ success: true, connectionId: connection.id });
  } catch (error) {
    console.error("PrestaShop connection error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to connect to PrestaShop",
      },
      { status: 500 },
    );
  }
});
