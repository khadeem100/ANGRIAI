import { useMemo } from "react";
import { useIntegrations } from "@/hooks/useIntegrations";

export function useInstalledIntegrations() {
  const { data, isLoading, error } = useIntegrations();

  const installedIntegrations = useMemo(() => {
    if (!data?.integrations) return [];

    // Filter to only show integrations that are connected (installed)
    return data.integrations
      .filter((integration) => integration.connection?.id)
      .map((integration) => ({
        name: integration.name,
        displayName: integration.displayName,
        logo: integration.logo,
        isActive: integration.connection?.isActive || false,
        connectionId: integration.connection?.id || "",
      }));
  }, [data]);

  return {
    installedIntegrations,
    isLoading,
    error,
  };
}
