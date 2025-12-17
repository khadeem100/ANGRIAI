"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, ExternalLink, Receipt, Loader2 } from "lucide-react";
import { LoadingContent } from "@/components/LoadingContent";
import { usePremium } from "@/components/PremiumAlert";
import { getStripe } from "@/ee/billing/stripe";

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoicePdf: string | null;
  hostedInvoiceUrl: string | null;
}

export function InvoicesPanel() {
  const { premium, isLoading: premiumLoading } = usePremium();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      if (!premium?.stripeCustomerId) {
        setIsLoading(false);
        return;
      }

      try {
        // TODO: Create API endpoint to fetch invoices
        // For now, showing placeholder
        setInvoices([]);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!premiumLoading) {
      fetchInvoices();
    }
  }, [premium, premiumLoading]);

  if (premiumLoading || isLoading) {
    return <LoadingContent loading={true}>Loading invoices...</LoadingContent>;
  }

  if (!premium?.stripeCustomerId && !premium?.lemonSqueezyCustomerId) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Invoices</h3>
        <p className="text-muted-foreground">You don't have any invoices yet</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Invoices Yet</h3>
        <p className="text-muted-foreground">
          Your invoices will appear here once you have a subscription
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>
                  {new Date(invoice.created * 1000).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: invoice.currency,
                  }).format(invoice.amount / 100)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "paid" ? "default" : "secondary"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {invoice.invoicePdf && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={invoice.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {invoice.hostedInvoiceUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
