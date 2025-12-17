import { redirectToEmailAccountPath } from "@/utils/account";

export default async function DashboardRedirectPage() {
  await redirectToEmailAccountPath("/dashboard");
}
