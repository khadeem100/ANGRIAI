"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastError, toastSuccess } from "@/components/Toast";
import { Loader2 } from "lucide-react";
import { fetchWithAccount } from "@/utils/fetch";
import { useAccount } from "@/providers/EmailAccountProvider";

function normalizeBaseUrl(input: string): string {
  const trimmed = String(input).trim();
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withScheme).toString();
}

const formSchema = z.object({
  baseUrl: z.string().min(1, "Shop URL is required"),
  apiKey: z.string().min(1, "API key is required"),
});

interface PrestashopConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PrestashopConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: PrestashopConnectModalProps) {
  const { emailAccountId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseUrl: "",
      apiKey: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let normalizedBaseUrl: string;
      try {
        normalizedBaseUrl = normalizeBaseUrl(values.baseUrl);
      } catch {
        throw new Error(
          "Invalid shop URL. Please enter a valid URL like https://gato.nl (do not include /api).",
        );
      }

      const response = await fetchWithAccount({
        url: "/api/mcp/prestashop/auth",
        emailAccountId,
        init: {
          method: "POST",
          body: JSON.stringify({ ...values, baseUrl: normalizedBaseUrl }),
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to connect to PrestaShop");
      }

      toastSuccess({
        title: "Connected to PrestaShop",
        description: "Your PrestaShop shop has been successfully linked.",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toastError({
        title: "Connection Failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not connect to PrestaShop",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect PrestaShop</DialogTitle>
          <DialogDescription>
            Enter your PrestaShop shop URL and API key to enable AI-powered
            operations.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://gato.nl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your PrestaShop Webservice API key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
