import { redirectToEmailAccountPath } from "@/utils/account";

export default async function TodosRedirectPage() {
  await redirectToEmailAccountPath("/todos");
}
