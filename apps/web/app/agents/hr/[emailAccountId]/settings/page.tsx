import { Suspense } from "react";
import { SettingsTab } from "@/app/(app)/[emailAccountId]/assistant/settings/SettingsTab";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";

export default function HrSettingsPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="HR Settings"
          description="Configure your HR AI Agent."
        />
        <SettingsTab />
      </PageWrapper>
    </Suspense>
  );
}
