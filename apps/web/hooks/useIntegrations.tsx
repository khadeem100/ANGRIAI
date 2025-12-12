import useSWR from "swr";
import type { GetIntegrationsResponse } from "@/app/api/mcp/integrations/route";
import { useAccount } from "@/providers/EmailAccountProvider";
import { fetchWithAccount } from "@/utils/fetch";

export function useIntegrations() {
  const { emailAccountId } = useAccount();
  return useSWR<GetIntegrationsResponse, Error, [string, string] | null>(
    emailAccountId ? ["/api/mcp/integrations", emailAccountId] : null,
    async ([url, id]) => {
      const apiUrl = `${url}?emailAccountId=${encodeURIComponent(id)}`;
      const res = await fetchWithAccount({ url: apiUrl, emailAccountId: id });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const error: Error & { info?: any; status?: number } = new Error(
          data?.error || `Request failed with status ${res.status}`,
        );
        error.info = data;
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
  );
}
