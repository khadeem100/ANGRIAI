import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSignIcon } from "lucide-react";

export default function PayrollPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Payroll & Expenses"
          description="Manage payroll inquiries and expense reports."
        />
        <div className="grid gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5" />
                Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No recent expense claims.
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </Suspense>
  );
}
