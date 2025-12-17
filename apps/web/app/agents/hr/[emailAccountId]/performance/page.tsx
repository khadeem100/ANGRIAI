import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardListIcon } from "lucide-react";

export default function PerformancePage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Performance Management"
          description="Track reviews, feedback, and goals."
        />
        <div className="grid gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardListIcon className="h-5 w-5" />
                Performance Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No active performance cycles.
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </Suspense>
  );
}
