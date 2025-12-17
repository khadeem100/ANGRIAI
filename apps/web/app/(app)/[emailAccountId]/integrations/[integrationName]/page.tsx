import { PageWrapper } from "@/components/PageWrapper";
import { IntegrationDetail } from "@/app/(app)/[emailAccountId]/integrations/[integrationName]/IntegrationDetail";

export default function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ emailAccountId: string; integrationName: string }>;
}) {
  return (
    <PageWrapper>
      <IntegrationDetail params={params} />
    </PageWrapper>
  );
}
