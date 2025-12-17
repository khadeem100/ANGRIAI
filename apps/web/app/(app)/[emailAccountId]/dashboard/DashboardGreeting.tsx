"use client";

import { useAccount } from "@/providers/EmailAccountProvider";
import { PageHeading } from "@/components/Typography";

export function DashboardGreeting() {
  const { emailAccount } = useAccount();

  // Get first name from email account, fallback to "user"
  const userName = emailAccount?.name?.split(" ")[0] || "user";

  return (
    <div className="mb-6">
      <PageHeading>Hello {userName} 👋</PageHeading>
      <p className="text-muted-foreground mt-1">
        Here's what's happening with your inbox today
      </p>
    </div>
  );
}
