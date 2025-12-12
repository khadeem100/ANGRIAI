"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { saveConnectionConfigSchema } from "@/utils/actions/connection-config.validation";
import { saveConnectionConfigAction } from "@/utils/actions/connection-config";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toastError, toastSuccess } from "@/components/Toast";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

interface ImapConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (emailAccountId: string) => void;
}

export function ImapConnectModal({ isOpen, onClose, onSuccess }: ImapConnectModalProps) {
  const form = useForm<z.infer<typeof saveConnectionConfigSchema>>({
    resolver: zodResolver(saveConnectionConfigSchema),
    defaultValues: {
      imapHost: "",
      imapPort: 993,
      imapUser: "",
      imapPass: "",
      imapSecure: true,
      smtpHost: "",
      smtpPort: 465,
      smtpUser: "",
      smtpPass: "",
      smtpSecure: true,
    },
  });

  const { execute, status } = useAction(saveConnectionConfigAction, {
    onSuccess: (result) => {
      if (result.data?.emailAccountId) {
        toastSuccess({
          title: "Account Connected",
          description: "Your IMAP account has been successfully connected.",
        });
        onSuccess(result.data.emailAccountId);
        onClose();
      }
    },
    onError: (error) => {
      toastError({
        title: "Connection Failed",
        description: error.error.serverError || "Could not save connection settings",
      });
    },
  });

  const isLoading = status === "executing";

  function onSubmit(values: z.infer<typeof saveConnectionConfigSchema>) {
    execute(values);
  }

  // Helper to sync user/pass from IMAP to SMTP if mostly same
  const handleImapUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("imapUser", val);
    if (!form.getValues("smtpUser")) {
        form.setValue("smtpUser", val);
    }
  };

  const handleImapPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("imapPass", val);
    if (!form.getValues("smtpPass")) {
        form.setValue("smtpPass", val);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect via IMAP/SMTP</DialogTitle>
          <DialogDescription>
            Enter your email provider's server details to connect your account manually.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">IMAP Settings (Incoming)</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="imapHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMAP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="imap.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imapPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imapUser"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Username / Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} onChange={handleImapUserChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imapPass"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} onChange={handleImapPassChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imapSecure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Use SSL/TLS
                        </FormLabel>
                        <FormDescription>
                          Usually required for port 993
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="col-span-2">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">SMTP Settings (Outgoing)</h3>
                </div>

                <FormField
                  control={form.control}
                  name="smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="smtpPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpPass"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smtpSecure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Use SSL/TLS
                        </FormLabel>
                        <FormDescription>
                          Usually required for port 465
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Account
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
