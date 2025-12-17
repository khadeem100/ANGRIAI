import prisma from "@/utils/prisma";

export async function hasUserPurchasedIntegration(
  userId: string,
  integrationName: string,
): Promise<boolean> {
  const purchase = await prisma.integrationPurchase.findFirst({
    where: {
      userId,
      integrationName,
      status: "succeeded",
    },
  });

  return !!purchase;
}

export async function getUserIntegrationPurchases(userId: string) {
  return await prisma.integrationPurchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
