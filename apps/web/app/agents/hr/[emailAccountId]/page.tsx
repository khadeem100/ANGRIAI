import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { PermissionsCheck } from "@/app/(app)/[emailAccountId]/PermissionsCheck";
import { checkUserOwnsEmailAccount } from "@/utils/email-account";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon,
  UserPlusIcon,
  CalendarCheckIcon,
  DollarSignIcon,
  AlertCircleIcon,
} from "lucide-react";

export default async function HrDashboard({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;
  await checkUserOwnsEmailAccount({ emailAccountId });

  return (
    <Suspense>
      <PermissionsCheck />

      <PageWrapper>
        <PageHeader
          title="HR Overview"
          description="Manage your team, recruitment, and HR operations."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Employees
              </CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total active headcount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Roles</CardTitle>
              <UserPlusIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Positions hiring for
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Leave
              </CardTitle>
              <CalendarCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Requests awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Expenses
              </CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Claims to review</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No recent activity
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 rounded-lg border p-3">
                  <AlertCircleIcon className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-medium">Setup HR Rules</div>
                    <div className="text-sm text-muted-foreground">
                      Define your automated HR workflows
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </Suspense>
  );
}
