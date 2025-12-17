"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RefreshCwIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useAccount } from "@/providers/EmailAccountProvider";

export function SyncEmailsSection() {
  const { emailAccountId, provider } = useAccount();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{
    success: boolean;
    count: number;
    message: string;
  } | null>(null);

  // Only show for IMAP accounts
  if (provider !== "imap" && provider !== "custom") {
    return null;
  }

  const handleSync = async () => {
    setIsSyncing(true);
    setLastSync(null);

    try {
      const response = await fetch("/api/user/sync-emails", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setLastSync({
          success: true,
          count: data.count || 0,
          message: data.message,
        });
        toast.success(data.message || "Emails synced successfully", {
          description:
            data.count > 0
              ? `Synced ${data.count} new message${data.count === 1 ? "" : "s"}`
              : undefined,
        });
      } else {
        setLastSync({
          success: false,
          count: 0,
          message: data.error || "Failed to sync emails",
        });
        toast.error("Sync failed", {
          description: data.error || "Failed to sync emails",
        });
      }
    } catch (error) {
      setLastSync({
        success: false,
        count: 0,
        message: "Network error occurred",
      });
      toast.error("Sync failed", {
        description: "Network error occurred",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync Emails</CardTitle>
        <CardDescription>
          Manually sync your IMAP emails. Emails are automatically synced every
          minute in production.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
            <RefreshCwIcon
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>

          {lastSync && (
            <div className="flex items-center gap-2 text-sm">
              {lastSync.success ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">{lastSync.message}</span>
                </>
              ) : (
                <>
                  <AlertCircleIcon className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">{lastSync.message}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> In development, you need to manually trigger
            sync. In production, emails are automatically synced every minute
            via cron job.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
