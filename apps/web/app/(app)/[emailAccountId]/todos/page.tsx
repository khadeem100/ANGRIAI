import { Suspense } from "react";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import { PageWrapper } from "@/components/PageWrapper";
import { TodosContent } from "./TodosContent";
import { LoadingContent } from "@/components/LoadingContent";

export default async function TodosPage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <PageWrapper>
      <Suspense
        fallback={
          <LoadingContent loading={true}>Loading todos...</LoadingContent>
        }
      >
        <TodosContent />
      </Suspense>
    </PageWrapper>
  );
}
