import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/utils/auth";
import { WELCOME_PATH } from "@/utils/config";
import { AuthPage } from "@/components/ui/auth-page";

export const metadata: Metadata = {
  title: "Inloggen | Angri",
  description: "Log in bij Angri.",
  alternates: { canonical: "/login" },
};

export default async function AuthenticationPage(props: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (session?.user && !searchParams?.error) {
    if (searchParams?.next) {
      redirect(searchParams?.next);
    } else {
      redirect(WELCOME_PATH);
    }
  }

  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}

