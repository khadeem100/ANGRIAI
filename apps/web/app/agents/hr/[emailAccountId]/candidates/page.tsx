import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CandidatesPage() {
  return (
    <Suspense>
      <PageWrapper>
        <PageHeader
          title="Candidates"
          description="Track job applications and interview status."
        />
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
              Connect your ATS or forward resumes here to start tracking
              candidates.
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </Suspense>
  );
}
