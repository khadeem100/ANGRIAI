import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

export default function EmployeesPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Employees"
          description="Directory of all active employees and their records."
        />
        <div className="grid gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                Employee Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No employees found. Import your employee list to get started.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </Suspense>
  );
}
