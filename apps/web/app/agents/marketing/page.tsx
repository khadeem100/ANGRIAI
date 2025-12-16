import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/utils/auth";
import prisma from "@/utils/prisma";
import { PageWrapper } from "@/components/PageWrapper";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export default async function MarketingRootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?callbackUrl=${encodeURIComponent(`https://marketing.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "angri.nl"}`)}`,
    );
  }

  const accounts = await prisma.emailAccount.findMany({
    where: { userId: session.user.id },
    select: { id: true, email: true, name: true },
  });

  if (accounts.length === 1) {
    redirect(`/${accounts[0].id}`);
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Select Account"
        description="Choose an email account to manage with the Marketing Agent."
      />

      <div className="grid gap-4 mt-8 max-w-2xl">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {account.email}
              </CardTitle>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/${account.id}`}>
                  Select <ArrowRightIcon className="ml-2 size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {account.name || "Unnamed Account"}
              </div>
            </CardContent>
          </Card>
        ))}

        {accounts.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Accounts Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                You need to connect an email account first.
              </p>
              <Button asChild>
                <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/setup`}>
                  Connect Account
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
