import { PageWrapper } from "@/components/PageWrapper";
import { PageHeader } from "@/components/PageHeader";
import { AppStore } from "@/app/(app)/[emailAccountId]/integrations/AppStore";
import { Button } from "@/components/ui/button";
import { RequestAccessDialog } from "./RequestAccessDialog";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function IntegrationsPage() {
  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <PageHeader
              title="App Store"
              description="Discover and install integrations to supercharge your workflow"
            />
          </div>
          <RequestAccessDialog
            trigger={
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Request Integration
              </Button>
            }
          />
        </div>

        {/* App Store Content */}
        <AppStore />
      </div>
    </PageWrapper>
  );
}
