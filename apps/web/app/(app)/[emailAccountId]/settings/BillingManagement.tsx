"use client";

import { usePremium } from "@/components/PremiumAlert";
import { ManageSubscription } from "@/app/(app)/premium/ManageSubscription";
import { LoadingContent } from "@/components/LoadingContent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, CreditCard, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function BillingManagement() {
  const { premium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <LoadingContent loading={true}>
        Loading billing information...
      </LoadingContent>
    );
  }

  const hasSubscription =
    premium?.lemonSqueezyCustomerId || premium?.stripeSubscriptionId;

  return (
    <div className="space-y-6">
      {hasSubscription ? (
        <>
          {/* Subscription Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {premium?.tier || "Premium"} Plan
              </p>
            </div>
          </div>

          <Separator />

          {/* Subscription Details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">
                      {premium?.stripeSubscriptionStatus || "Active"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Renews On</p>
                    <p className="font-semibold">
                      {premium?.stripeRenewsAt
                        ? new Date(premium.stripeRenewsAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Manage Subscription Button */}
          <div className="flex justify-start">
            <ManageSubscription premium={premium} />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-6">
            Upgrade to premium to unlock all features
          </p>
          <a
            href="/premium"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            View Plans
          </a>
        </div>
      )}
    </div>
  );
}
