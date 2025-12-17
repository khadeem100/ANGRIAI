import { Suspense } from "react";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import { DashboardContent } from "./DashboardContent";
import { PageWrapper } from "@/components/PageWrapper";
import { DashboardGreeting } from "./DashboardGreeting";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <PageWrapper>
      <DashboardGreeting />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageWrapper>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...new Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...new Array(2)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
