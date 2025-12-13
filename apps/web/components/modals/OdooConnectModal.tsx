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

const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL (e.g. https://my-company.odoo.com)"),
  db: z.string().min(1, "Database name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password or API Key is required"),
});

interface OdooConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OdooConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: OdooConnectModalProps) {
  const { emailAccountId } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      db: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetchWithAccount({
        url: "/api/mcp/odoo/auth",
        emailAccountId,
        init: {
          method: "POST",
          body: JSON.stringify(values),
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to connect to Odoo");
      }

      toastSuccess({
        title: "Connected to Odoo",
        description: "Your Odoo account has been successfully linked.",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toastError({
        title: "Connection Failed",
        description:
          error instanceof Error ? error.message : "Could not connect to Odoo",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Odoo</DialogTitle>
          <DialogDescription>
            Enter your Odoo instance details to enable AI integration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odoo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://my-company.odoo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="db"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name</FormLabel>
                  <FormControl>
                    <Input placeholder="odoo_db" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password or API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
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
