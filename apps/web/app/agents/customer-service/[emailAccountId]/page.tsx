import { Suspense } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RulesTab } from "@/app/(app)/[emailAccountId]/assistant/RulesTabNew";
import { SettingsTab } from "@/app/(app)/[emailAccountId]/assistant/settings/SettingsTab";
import { Process } from "@/app/(app)/[emailAccountId]/assistant/Process";
import { History } from "@/app/(app)/[emailAccountId]/assistant/History";
import { PermissionsCheck } from "@/app/(app)/[emailAccountId]/PermissionsCheck";
import { TabSelect } from "@/components/TabSelect";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";

const tabOptions = (emailAccountId: string) => [
  {
    id: "rules",
    label: "Rules",
    href: `/${emailAccountId}?tab=rules`,
  },
  {
    id: "test",
    label: "Test",
    href: `/${emailAccountId}?tab=test`,
  },
  {
    id: "history",
    label: "History",
    href: `/${emailAccountId}?tab=history`,
  },
  {
    id: "settings",
    label: "Settings",
    href: `/${emailAccountId}?tab=settings`,
  },
];

export default async function CustomerServiceDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ emailAccountId: string }>;
  searchParams: Promise<{ tab: string }>;
}) {
  const { emailAccountId } = await params;
  const { tab } = await searchParams;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <Suspense>
      <PermissionsCheck />

      <PageWrapper>
        <PageHeader
          title="Overview"
          description="Manage your Customer Service Agent's behavior and performance."
        />

        <div className="border-b border-neutral-200 pt-2 mb-6">
          <TabSelect
            options={tabOptions(emailAccountId)}
            selected={tab ?? "rules"}
          />
        </div>

        <Tabs defaultValue={tab || "rules"} value={tab || "rules"}>
          <TabsContent value="rules" className="mb-10">
            <RulesTab />
          </TabsContent>
          <TabsContent value="settings" className="mb-10">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="test" className="mb-10">
            <Process />
          </TabsContent>
          <TabsContent value="history" className="mb-10">
            <History />
          </TabsContent>
        </Tabs>
      </PageWrapper>
    </Suspense>
  );
}
