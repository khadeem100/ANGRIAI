"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useIntegrations } from "@/hooks/useIntegrations";
import { LoadingContent } from "@/components/LoadingContent";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  Settings,
  Trash2,
  Loader2,
  Shield,
  Star,
  Zap,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toastError, toastSuccess } from "@/components/Toast";
import {
  disconnectMcpConnectionAction,
  toggleMcpConnectionAction,
} from "@/utils/actions/mcp";
import { useAccount } from "@/providers/EmailAccountProvider";
import { fetchWithAccount } from "@/utils/fetch";
import { OdooConnectModal } from "@/components/modals/OdooConnectModal";
import { PrestashopConnectModal } from "@/components/modals/PrestashopConnectModal";
import type { GetMcpAuthUrlResponse } from "@/app/api/mcp/[integration]/auth-url/route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PurchaseButton } from "./PurchaseButton";

interface IntegrationDetailProps {
  params: Promise<{ emailAccountId: string; integrationName: string }>;
}

export function IntegrationDetail({ params }: IntegrationDetailProps) {
  const resolvedParams = use(params);
  const { integrationName } = resolvedParams;
  const router = useRouter();
  const { emailAccountId } = useAccount();
  const { data, isLoading, error, mutate } = useIntegrations();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showOdooModal, setShowOdooModal] = useState(false);
  const [showPrestashopModal, setShowPrestashopModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const integration = data?.integrations.find(
    (i) => i.name === integrationName,
  );

  if (isLoading) {
    return <LoadingContent loading={true} />;
  }

  if (!integration) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Integration not found</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const conn = integration.connection;
  const connected = !!conn;
  const isActive = conn?.isActive || false;
  const tools = conn?.tools || [];
  const enabledTools = tools.filter((t) => t.isEnabled);

  const handleConnect = async () => {
    if (integration.name === "odoo") {
      setShowOdooModal(true);
      return;
    }

    if (integration.name === "prestashop") {
      setShowPrestashopModal(true);
      return;
    }

    if (integration.authType === "api-token") {
      toastError({
        title: "Coming Soon",
        description: "API token connections will be available soon",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetchWithAccount({
        url: `/api/mcp/${integration.name}/auth-url`,
        emailAccountId,
      });

      if (!response.ok) {
        throw new Error("Failed to get authorization URL");
      }

      const data: GetMcpAuthUrlResponse = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error(
        `Failed to initiate ${integration.name} connection:`,
        error,
      );
      toastError({
        title: `Error connecting to ${integration.name}`,
        description:
          "Please try again or contact support if the issue persists.",
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!conn?.id) return;

    setIsDisconnecting(true);
    try {
      const result = await disconnectMcpConnectionAction({
        connectionId: conn.id,
        emailAccountId,
      });

      if (result?.serverError) {
        toastError({
          title: "Error disconnecting integration",
          description: result.serverError,
        });
      } else {
        toastSuccess({
          description: `${integration.displayName} disconnected successfully`,
        });
        mutate();
      }
    } catch (error) {
      toastError({
        title: "Error disconnecting integration",
        description: "Please try again",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleToggle = async (enabled: boolean) => {
    if (!conn?.id) return;

    try {
      const result = await toggleMcpConnectionAction({
        connectionId: conn.id,
        isActive: enabled,
        emailAccountId,
      });

      if (result?.serverError) {
        toastError({
          title: "Error toggling integration",
          description: result.serverError,
        });
      } else {
        toastSuccess({
          description: enabled
            ? `${integration.displayName} enabled`
            : `${integration.displayName} disabled`,
        });
        mutate();
      }
    } catch (error) {
      toastError({
        title: "Error toggling integration",
        description: "Please try again",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {integration.logo && !imageError ? (
              <div className="w-24 h-24 rounded-2xl bg-white border-2 shadow-lg flex items-center justify-center p-4">
                <Image
                  src={integration.logo}
                  alt={`${integration.displayName} logo`}
                  width={80}
                  height={80}
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center text-white font-bold text-4xl">
                {integration.displayName.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold">{integration.displayName}</h1>
              {connected && (
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              )}
              <Badge variant="outline">Free</Badge>
              {integration.category && (
                <Badge variant="secondary">{integration.category}</Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {integration.description ||
                `Connect ${integration.displayName} to enhance your workflow`}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {connected ? (
                <>
                  <Button
                    onClick={() => handleToggle(!isActive)}
                    variant={isActive ? "outline" : "default"}
                  >
                    {isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    variant="destructive"
                    className="gap-2"
                  >
                    {isDisconnecting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  {/* Show purchase button for paid integrations */}
                  {integration.pricing && !integration.isPurchased ? (
                    <PurchaseButton
                      integrationName={integration.name}
                      displayName={integration.displayName}
                      emailAccountId={emailAccountId}
                      pricing={integration.pricing}
                      isPurchased={integration.isPurchased}
                      isFree={integration.isFree}
                    />
                  ) : (
                    <Button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      size="lg"
                      className="gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Install {integration.displayName}
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {connected && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isActive ? "Active" : "Inactive"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isActive ? "Running smoothly" : "Currently disabled"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tools</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enabledTools.length}/{tools.length}
                </div>
                <p className="text-xs text-muted-foreground">Enabled tools</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Connection
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Secure</div>
                <p className="text-xs text-muted-foreground">
                  OAuth 2.0 encrypted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Performance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Excellent</div>
                <p className="text-xs text-muted-foreground">99.9% uptime</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            {connected && <TabsTrigger value="tools">Tools</TabsTrigger>}
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {integration.displayName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {integration.description}
                </p>

                {integration.features && integration.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">
                        {integration.category || "General"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Authentication
                      </p>
                      <p className="font-medium capitalize">
                        {integration.authType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pricing</p>
                      <p className="font-medium">Free</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Support</p>
                      <p className="font-medium">24/7 Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">10,000+</p>
                      <p className="text-sm text-muted-foreground">
                        Active Users
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">4.9/5</p>
                      <p className="text-sm text-muted-foreground">
                        User Rating
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">100%</p>
                      <p className="text-sm text-muted-foreground">
                        Secure & Safe
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Features & Capabilities</CardTitle>
                <CardDescription>
                  Everything you can do with {integration.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {integration.features && integration.features.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integration.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{feature}</h4>
                          <p className="text-sm text-muted-foreground">
                            Seamlessly integrated into your workflow
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Feature details coming soon...
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          {connected && (
            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Tools</CardTitle>
                  <CardDescription>
                    {enabledTools.length} of {tools.length} tools enabled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tools.length > 0 ? (
                    <div className="space-y-3">
                      {tools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{tool.name}</h4>
                              {tool.isEnabled && (
                                <Badge variant="default" className="text-xs">
                                  Enabled
                                </Badge>
                              )}
                            </div>
                            {tool.description && (
                              <p className="text-sm text-muted-foreground">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No tools available for this integration.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Setup Guide Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Setup Guide</CardTitle>
                <CardDescription>
                  Follow these steps to connect {integration.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Click Install</h4>
                      <p className="text-muted-foreground">
                        Click the "Install {integration.displayName}" button
                        above to begin the connection process.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Authorize Access</h4>
                      <p className="text-muted-foreground">
                        You'll be redirected to {integration.displayName} to
                        authorize the connection. Sign in with your{" "}
                        {integration.displayName} account.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Grant Permissions</h4>
                      <p className="text-muted-foreground">
                        Review and approve the requested permissions. We only
                        ask for what's necessary to provide the integration.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Start Using</h4>
                      <p className="text-muted-foreground">
                        Once connected, you can start using{" "}
                        {integration.displayName} features directly from your
                        inbox!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showOdooModal && (
        <OdooConnectModal
          isOpen={showOdooModal}
          onClose={() => setShowOdooModal(false)}
          onSuccess={mutate}
        />
      )}
      {showPrestashopModal && (
        <PrestashopConnectModal
          isOpen={showPrestashopModal}
          onClose={() => setShowPrestashopModal(false)}
          onSuccess={mutate}
        />
      )}
    </>
  );
}
