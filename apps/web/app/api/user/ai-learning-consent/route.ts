import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import prisma from "@/utils/prisma";

export const POST = withEmailAccount(
  "user/ai-learning-consent",
  async (request) => {
    const { emailAccountId } = request.auth;
    const body = await request.json();
    const { consent } = body;

    if (typeof consent !== "boolean") {
      return NextResponse.json(
        { error: "Invalid consent value" },
        { status: 400 },
      );
    }

    await prisma.emailAccount.update({
      where: { id: emailAccountId },
      data: {
        aiLearningConsent: consent,
        aiLearningConsentAt: consent ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, consent });
  },
);

export const GET = withEmailAccount(
  "user/ai-learning-consent",
  async (request) => {
    const { emailAccountId } = request.auth;

    const emailAccount = await prisma.emailAccount.findUnique({
      where: { id: emailAccountId },
      select: {
        aiLearningConsent: true,
        aiLearningConsentAt: true,
      },
    });

    return NextResponse.json({
      consent: emailAccount?.aiLearningConsent ?? null,
      consentAt: emailAccount?.aiLearningConsentAt ?? null,
    });
  },
);
