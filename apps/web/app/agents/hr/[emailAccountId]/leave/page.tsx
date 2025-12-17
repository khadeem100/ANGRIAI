import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheckIcon } from "lucide-react";

export default function LeavePage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Time Off"
          description="Review and approve leave requests."
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheckIcon className="h-5 w-5" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              No pending leave requests.
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </Suspense>
  );
}
