"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, CheckCircle2 } from "lucide-react";
import { toastError, toastSuccess } from "@/components/Toast";
import { purchaseIntegrationAction } from "@/utils/actions/integrations";

interface PurchaseButtonProps {
  integrationName: string;
  displayName: string;
  emailAccountId: string;
  pricing?: {
    amount: number;
    currency: string;
  };
  isPurchased?: boolean;
  isFree?: boolean;
}

export function PurchaseButton({
  integrationName,
  displayName: _displayName,
  emailAccountId,
  pricing,
  isPurchased,
  isFree,
}: PurchaseButtonProps) {
  void _displayName; // Reserved for future use
  const [isProcessing, setIsProcessing] = useState(false);

  if (isFree || !pricing) {
    return null; // Free integrations don't need purchase button
  }

  if (isPurchased) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Purchased</span>
      </div>
    );
  }

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const result = await purchaseIntegrationAction({
        integrationName,
        emailAccountId,
      });

      if (result?.serverError) {
        toastError({
          title: "Purchase failed",
          description: result.serverError,
        });
      } else if (result?.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = result.data.url;
      }
    } catch (error) {
      toastError({
        title: "Purchase failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const priceDisplay = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: pricing.currency,
  }).format(pricing.amount / 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">One-time purchase</div>
      <Button
        onClick={handlePurchase}
        disabled={isProcessing}
        size="lg"
        className="gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Purchase for {priceDisplay}
          </>
        )}
      </Button>
    </div>
  );
}
