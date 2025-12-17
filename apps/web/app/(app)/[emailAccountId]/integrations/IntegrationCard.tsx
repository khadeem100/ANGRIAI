"use client";

import { useState } from "react";
import type { GetIntegrationsResponse } from "@/app/api/mcp/integrations/route";
import type { GetMcpAuthUrlResponse } from "@/app/api/mcp/[integration]/auth-url/route";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Settings,
  Trash2,
  Loader2,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Star,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";
import Link from "next/link";
import Image from "next/image";

interface IntegrationCardProps {
  integration: GetIntegrationsResponse["integrations"][number];
  onConnectionChange: () => void;
  viewMode?: "grid" | "list";
}

export function IntegrationCard({
  integration,
  onConnectionChange,
  viewMode = "grid",
}: IntegrationCardProps) {
  const { emailAccountId } = useAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showOdooModal, setShowOdooModal] = useState(false);
  const [showPrestashopModal, setShowPrestashopModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const conn = integration.connection;
  const connected = !!conn;
  const isActive = conn?.isActive || false;
  const toolsCount = conn?.tools?.filter((t) => t.isEnabled).length || 0;
  const totalTools = conn?.tools?.length || 0;

  // Use provided description or generate one
  const description =
    integration.description ||
    `Connect ${integration.displayName} to enhance your workflow with powerful automation and data sync capabilities.`;

  // Get detail page URL with emailAccountId
  const detailUrl = `/${emailAccountId}/integrations/${integration.name}`;

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
      const result = await disconnectMcpConnectionAction(emailAccountId, {
        connectionId: conn.id,
      });

      if (result?.serverError) {
        toastError({
          title: "Error disconnecting integration",
          description: result.serverError,
        });
      } else {
        toastSuccess({
          description: `${integration.name} disconnected successfully`,
        });
        onConnectionChange();
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
      const result = await toggleMcpConnectionAction(emailAccountId, {
        connectionId: conn.id,
        isActive: enabled,
      });

      if (result?.serverError) {
        toastError({
          title: "Error toggling integration",
          description: result.serverError,
        });
      } else {
        toastSuccess({
          description: enabled
            ? `${integration.name} enabled`
            : `${integration.name} disabled`,
        });
        onConnectionChange();
      }
    } catch (error) {
      toastError({
        title: "Error toggling integration",
        description: "Please try again",
      });
    }
  };

  // Render integration logo with error handling
  const renderLogo = (size = 40) => {
    if (integration.logo && !imageError) {
      return (
        <Image
          src={integration.logo}
          alt={`${integration.displayName} logo`}
          width={size}
          height={size}
          className="object-contain"
          onError={() => setImageError(true)}
        />
      );
    }
    // Fallback placeholder with first letter
    const fontSize = size > 48 ? "text-2xl" : "text-lg";
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white font-bold ${fontSize}`}
      >
        {integration.displayName.charAt(0)}
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <>
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 p-6">
            {/* Icon */}
            <Link href={detailUrl} className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-white border flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                {renderLogo(40)}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link href={detailUrl} className="hover:underline">
                  <h3 className="font-semibold text-lg">
                    {integration.displayName}
                  </h3>
                </Link>
                {connected && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
                <Badge variant="outline">Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {description}
              </p>
              {connected && totalTools > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {toolsCount} of {totalTools} tools enabled
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(!isActive)}
                  >
                    {isActive ? "Disable" : "Enable"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggle(!isActive)}>
                        {isActive ? "Disable" : "Enable"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Install
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Modals */}
        {showOdooModal && (
          <OdooConnectModal
            isOpen={showOdooModal}
            onClose={() => setShowOdooModal(false)}
            onSuccess={onConnectionChange}
          />
        )}
        {showPrestashopModal && (
          <PrestashopConnectModal
            isOpen={showPrestashopModal}
            onClose={() => setShowPrestashopModal(false)}
            onSuccess={onConnectionChange}
          />
        )}
      </>
    );
  }

  // Grid view
  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-full">
        <CardHeader className="space-y-4">
          {/* Icon and Status */}
          <div className="flex items-start justify-between">
            <Link href={detailUrl}>
              <div className="w-14 h-14 rounded-xl bg-white border-2 flex items-center justify-center p-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                {renderLogo(48)}
              </div>
            </Link>
            {connected && (
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                {isActive ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>

          {/* Title and Description */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href={detailUrl} className="hover:underline">
                <CardTitle className="text-xl">
                  {integration.displayName}
                </CardTitle>
              </Link>
              <Badge variant="outline" className="text-xs">
                Free
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 min-h-[2.5rem]">
              {description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {/* Features/Stats */}
          <div className="space-y-2">
            {connected && totalTools > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>
                  {toolsCount} of {totalTools} tools enabled
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Trusted by thousands</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {connected ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleToggle(!isActive)}
              >
                {isActive ? "Disable" : "Enable"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleToggle(!isActive)}>
                    {isActive ? "Disable" : "Enable"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full gap-2 group-hover:shadow-md transition-shadow"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Install Now
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Modals */}
      {showOdooModal && (
        <OdooConnectModal
          isOpen={showOdooModal}
          onClose={() => setShowOdooModal(false)}
          onSuccess={onConnectionChange}
        />
      )}
      {showPrestashopModal && (
        <PrestashopConnectModal
          isOpen={showPrestashopModal}
          onClose={() => setShowPrestashopModal(false)}
          onSuccess={onConnectionChange}
        />
      )}
    </>
  );
}
