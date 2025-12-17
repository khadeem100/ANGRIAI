import { NextResponse } from "next/server";
import { getStripe } from "@/ee/billing/stripe";
import { withAuth } from "@/utils/middleware";
import prisma from "@/utils/prisma";
import { MCP_INTEGRATIONS } from "@/utils/mcp/integrations";
import { env } from "@/env";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("integrations/purchase");

export const POST = withAuth("integrations/purchase", async (request) => {
  const userId = request.auth.userId;
  const body = await request.json();
  const { integrationName, emailAccountId } = body;

  if (!integrationName || !emailAccountId) {
    return NextResponse.json(
      { error: "Integration name and email account ID are required" },
      { status: 400 },
    );
  }

  // Get integration config
  const integration = MCP_INTEGRATIONS[integrationName];
  if (!integration) {
    return NextResponse.json(
      { error: "Integration not found" },
      { status: 404 },
    );
  }

  // Check if integration has pricing
  if (!integration.pricing) {
    return NextResponse.json(
      { error: "This integration is free" },
      { status: 400 },
    );
  }

  // Check if user already purchased this integration
  const existingPurchase = await prisma.integrationPurchase.findFirst({
    where: {
      userId,
      integrationName,
      status: "succeeded",
    },
  });

  if (existingPurchase) {
    return NextResponse.json(
      { error: "You have already purchased this integration" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        premium: {
          select: { stripeCustomerId: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripeCustomerId = user.premium?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });

      stripeCustomerId = customer.id;

      // Update or create premium record
      if (user.premium) {
        await prisma.premium.update({
          where: { id: user.premium.id },
          data: { stripeCustomerId },
        });
      } else {
        await prisma.premium.create({
          data: {
            stripeCustomerId,
            users: { connect: { id: userId } },
          },
        });
      }
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: integration.pricing.currency,
            product_data: {
              name: `${integration.displayName} Integration`,
              description: integration.description,
              images: integration.logo ? [integration.logo] : [],
            },
            unit_amount: integration.pricing.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_BASE_URL}/${emailAccountId}/integrations/${integrationName}?purchase=success`,
      cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/${emailAccountId}/integrations/${integrationName}?purchase=cancelled`,
      metadata: {
        userId,
        integrationName,
        emailAccountId,
        type: "integration_purchase",
      },
    });

    logger.info("Created checkout session for integration purchase", {
      userId,
      integrationName,
      sessionId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error("Error creating checkout session", {
      error,
      userId,
      integrationName,
    });
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
});
