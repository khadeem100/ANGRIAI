import { Suspense } from "react";
import { SettingsTab } from "@/app/(app)/[emailAccountId]/assistant/settings/SettingsTab";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";

export default function MarketingSettingsPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Marketing Settings"
          description="Configure your Marketing AI Agent."
        />
        <SettingsTab />
      </PageWrapper>
    </Suspense>
  );
}
