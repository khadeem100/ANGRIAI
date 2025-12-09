import { env } from "@/env";
import type { PremiumTier } from "@/generated/prisma/enums";

type Feature = { text: string; tooltip?: string };

export type Tier = {
  name: string;
  tiers: { monthly: PremiumTier; annually: PremiumTier };
  price: { monthly: number; annually: number };
  discount: { monthly: number; annually: number };
  quantity?: number;
  description: string;
  features: Feature[];
  cta: string;
  ctaLink?: string;
  mostPopular?: boolean;
};

const pricing: Record<PremiumTier, number> = {
  BASIC_MONTHLY: 16,
  BASIC_ANNUALLY: 8,
  PRO_MONTHLY: 16,
  PRO_ANNUALLY: 10,
  BUSINESS_MONTHLY: 10, //eerste card maand
  BUSINESS_ANNUALLY: 100, // eerste card jaar
  BUSINESS_PLUS_MONTHLY: 25, // tweede card maand
  BUSINESS_PLUS_ANNUALLY: 250, // tweede card jaar
  COPILOT_MONTHLY: 500,
  LIFETIME: 299,
};

const variantIdToTier: Record<number, PremiumTier> = {
  [env.NEXT_PUBLIC_BASIC_MONTHLY_VARIANT_ID]: "BASIC_MONTHLY",
  [env.NEXT_PUBLIC_BASIC_ANNUALLY_VARIANT_ID]: "BASIC_ANNUALLY",
  [env.NEXT_PUBLIC_PRO_MONTHLY_VARIANT_ID]: "PRO_MONTHLY",
  [env.NEXT_PUBLIC_PRO_ANNUALLY_VARIANT_ID]: "PRO_ANNUALLY",
  [env.NEXT_PUBLIC_BUSINESS_MONTHLY_VARIANT_ID]: "BUSINESS_MONTHLY",
  [env.NEXT_PUBLIC_BUSINESS_ANNUALLY_VARIANT_ID]: "BUSINESS_ANNUALLY",
  [env.NEXT_PUBLIC_COPILOT_MONTHLY_VARIANT_ID]: "COPILOT_MONTHLY",
};

const STRIPE_PRICE_ID_CONFIG: Record<
  PremiumTier,
  {
    // active price id
    priceId?: string;
    // Allow handling of old price ids
    oldPriceIds?: string[];
  }
> = {
  BASIC_MONTHLY: { priceId: "price_1RfeDLKGf8mwZWHn6UW8wJcY" },
  BASIC_ANNUALLY: { priceId: "price_1RfeDLKGf8mwZWHn5kfC8gcM" },
  PRO_MONTHLY: {},
  PRO_ANNUALLY: {},
  BUSINESS_MONTHLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u73KGf8mwZWHn8VYFdALA",
      "price_1RMSnIKGf8mwZWHnlHP0212n",
      "price_1RfoILKGf8mwZWHnDiUMj6no",
      "price_1RfeAFKGf8mwZWHnnnPzFEky",
      "price_1RfSoHKGf8mwZWHnxTsSDTqW",
      "price_1Rg0QfKGf8mwZWHnDsiocBVD",
      "price_1Rg0LEKGf8mwZWHndYXYg7ie",
      "price_1Rg03pKGf8mwZWHnWMNeQzLc",
    ],
  },
  BUSINESS_ANNUALLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUALLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u6uKGf8mwZWHnEvPWuQzG",
      "price_1S1QGGKGf8mwZWHnYpUcqNua",
      "price_1RMSnIKGf8mwZWHnymtuW2s0",
      "price_1RfSoxKGf8mwZWHngHcug4YM",
    ],
  },
  BUSINESS_PLUS_MONTHLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_PLUS_MONTHLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u6NKGf8mwZWHnZCfy4D5n",
      "price_1RMSoMKGf8mwZWHn5fAKBT19",
    ],
  },
  BUSINESS_PLUS_ANNUALLY: {
    priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_PLUS_ANNUALLY_PRICE_ID,
    oldPriceIds: [
      "price_1S5u6XKGf8mwZWHnba8HX1H2",
      "price_1RMSoMKGf8mwZWHnGjf6fRmh",
    ],
  },
  COPILOT_MONTHLY: {},
  LIFETIME: {},
};

export function getStripeSubscriptionTier({
  priceId,
}: {
  priceId: string;
}): PremiumTier | null {
  const entries = Object.entries(STRIPE_PRICE_ID_CONFIG);

  for (const [tier, config] of entries) {
    if (config.priceId === priceId || config.oldPriceIds?.includes(priceId)) {
      return tier as PremiumTier;
    }
  }
  return null;
}

export function getStripePriceId({
  tier,
}: {
  tier: PremiumTier;
}): string | null {
  return STRIPE_PRICE_ID_CONFIG[tier]?.priceId ?? null;
}

function discount(monthly: number, annually: number) {
  return ((monthly - annually) / monthly) * 100;
}

export const businessTierName = "Starter";

const businessTier: Tier = {
  name: businessTierName,
  tiers: {
    monthly: "BUSINESS_MONTHLY",
    annually: "BUSINESS_ANNUALLY",
  },
  price: {
    monthly: pricing.BUSINESS_MONTHLY,
    annually: pricing.BUSINESS_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(pricing.BUSINESS_MONTHLY, pricing.BUSINESS_ANNUALLY),
  },
  description:
    "Voor individuen, ondernemers en leidinggevenden die tijd willen terugwinnen.",
  features: [
    {
      text: "Sorteert en labelt elke e-mail",
    },
    {
      text: "Stelt antwoorden op in jouw stem",
    },
    {
      text: "Blokkeert koude e-mails",
    },
    {
      text: "Bulk uitschrijven en e-mails archiveren",
    },
    {
      text: "E-mail analytics",
    },
  ],
  cta: "Probeer 14 dagen gratis",
  mostPopular: true,
};

const businessPlusTier: Tier = {
  name: "Professional",
  tiers: {
    monthly: "BUSINESS_PLUS_MONTHLY",
    annually: "BUSINESS_PLUS_ANNUALLY",
  },
  price: {
    monthly: pricing.BUSINESS_PLUS_MONTHLY,
    annually: pricing.BUSINESS_PLUS_ANNUALLY,
  },
  discount: {
    monthly: 0,
    annually: discount(
      pricing.BUSINESS_PLUS_MONTHLY,
      pricing.BUSINESS_PLUS_ANNUALLY,
    ),
  },
  description: "Voor teams en groeiende bedrijven die veel e-mail verwerken.",
  features: [
    {
      text: "Alles in Starter, plus:",
    },
    {
      text: "Onbeperkte kennisbank",
      tooltip:
        "De kennisbank wordt gebruikt om antwoorden op te stellen. Sla onbeperkt content op in je kennisbank.",
    },
    { text: "Team-brede analytics" },
    { text: "Prioriteit ondersteuning" },
    {
      text: "Toegewijde onboarding manager",
      tooltip:
        "We helpen je op weg met een onboarding call. Boek zoveel gratis gesprekken als nodig.",
    },
  ],
  cta: "Probeer 14 dagen gratis",
  mostPopular: false,
};

const enterpriseTier: Tier = {
  name: "Enterprise",
  tiers: {
    monthly: "COPILOT_MONTHLY",
    annually: "COPILOT_MONTHLY",
  },
  price: { monthly: 0, annually: 0 },
  discount: { monthly: 0, annually: 0 },
  description:
    "Voor organisaties met beveiliging en compliance-eisen op enterprise-niveau.",
  features: [
    {
      text: "Alles in Professional, plus:",
    },
    {
      text: "SSO inloggen",
    },
    {
      text: "On-premise implementatie (optioneel)",
    },
    {
      text: "Geavanceerde beveiliging & SLA",
    },
    {
      text: "Toegewijde accountmanager & training",
    },
  ],
  cta: "Praat met sales",
  ctaLink: "https://angri.nl/sales",
  mostPopular: false,
};

export function getLemonSubscriptionTier({
  variantId,
}: {
  variantId: number;
}): PremiumTier {
  const tier = variantIdToTier[variantId];
  if (!tier) throw new Error(`Unknown variant id: ${variantId}`);
  return tier;
}

export const tiers: Tier[] = [businessTier, businessPlusTier, enterpriseTier];
