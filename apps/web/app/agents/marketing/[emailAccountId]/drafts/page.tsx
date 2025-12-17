import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon } from "lucide-react";

export default function DraftsPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Drafts"
          description="Edit and review your campaign drafts."
        />
        <div className="grid gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PencilIcon className="h-5 w-5" />
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No drafts saved.
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </Suspense>
  );
}
