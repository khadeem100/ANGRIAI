import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MegaphoneIcon } from "lucide-react";

export default function CampaignsPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Campaigns"
          description="Manage your email marketing campaigns."
        />
        <div className="grid gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MegaphoneIcon className="h-5 w-5" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No active campaigns. Create your first one!
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </Suspense>
  );
}
