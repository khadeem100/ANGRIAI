"use client";

import { useState } from "react";
import {
  User,
  CreditCard,
  Receipt,
  Bell,
  Shield,
  Trash2,
  Key,
  Webhook,
  Mail,
  Brain,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileSection } from "./ProfileSection";
import { BillingManagement } from "./BillingManagement";
import { InvoicesPanel } from "./InvoicesPanel";
import { ApiKeysSection } from "./ApiKeysSection";
import { WebhookSection } from "./WebhookSection";
import { ModelSection } from "./ModelSection";
import { MultiAccountSection } from "./MultiAccountSection";
import { SyncEmailsSection } from "./SyncEmailsSection";
import { ResetAnalyticsSection } from "./ResetAnalyticsSection";
import { DeleteSection } from "./DeleteSection";
import { useAccount } from "@/providers/EmailAccountProvider";

export function ModernSettingsPage() {
  const { emailAccount } = useAccount();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="content-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, billing, and preferences
          </p>
        </div>

        {/* Modern Tabs Layout */}
        <Tabs defaultValue="profile" className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-card border rounded-lg p-1 shadow-sm">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-1 bg-transparent h-auto p-0">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger
                value="invoices"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
              >
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Invoices</span>
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md py-3"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="flex items-center gap-2 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground rounded-md py-3"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Danger</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileSection />
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team & Accounts
                </CardTitle>
                <CardDescription>
                  Manage multiple email accounts and team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiAccountSection />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription & Billing
                </CardTitle>
                <CardDescription>
                  Manage your subscription plan and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BillingManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Invoices & Payment History
                </CardTitle>
                <CardDescription>
                  View and download your invoices and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvoicesPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            {emailAccount && (
              <>
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Account Settings
                    </CardTitle>
                    <CardDescription>
                      Settings for {emailAccount.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SyncEmailsSection />
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      Manage your email analytics data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResetAnalyticsSection />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>
                  Configure your AI model preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModelSection />
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage your API keys for integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeysSection />
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Configure webhooks for external integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookSection />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <Card className="border-2 border-destructive shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions - proceed with caution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
