import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/app/(landing)/login/LoginForm";
import { auth } from "@/utils/auth";
import { AlertBasic } from "@/components/Alert";
import { env } from "@/env";
import { Button } from "@/components/ui/button";
import { WELCOME_PATH } from "@/utils/config";
import { CrispChatLoggedOutVisible } from "@/components/CrispChat";

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
    <div className="flex h-screen flex-col justify-center text-foreground">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col text-center">
          <h1 className="font-title text-2xl text-foreground">Inloggen</h1>
          <p className="mt-4 text-muted-foreground">
            Jouw persoonlijke AI-assistent voor e-mail.
          </p>
        </div>
        <div className="mt-4">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {searchParams?.error && <ErrorAlert error={searchParams?.error} />}

        <p className="px-8 pt-10 text-center text-sm text-muted-foreground">
          Door door te gaan ga je akkoord met onze{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Algemene Voorwaarden
          </Link>{" "}
          en{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacybeleid
          </Link>
          .
        </p>

        <p className="px-4 pt-4 text-center text-sm text-muted-foreground">
          Het gebruik en de overdracht door Angri AI van informatie ontvangen
          van Google API's aan een andere app voldoet aan het{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Google API Services User Data
          </a>{" "}
          Policy, inclusief de Limited Use-vereisten.
        </p>
      </div>
    </div>
  );
}

function ErrorAlert({ error }: { error: string }) {
  if (error === "RequiresReconsent") return null;

  if (error === "OAuthAccountNotLinked") {
    return (
      <AlertBasic
        variant="destructive"
        title="Account is al gekoppeld aan een andere gebruiker"
        description={
          <>
            <span>Je kunt accounts samenvoegen.</span>
            <Button asChild className="mt-2">
              <Link href="/accounts">Accounts samenvoegen</Link>
            </Button>
          </>
        }
      />
    );
  }

  return (
    <>
      <AlertBasic
        variant="destructive"
        title="Fout bij inloggen"
        description={`Er is een fout opgetreden bij het inloggen. Probeer het opnieuw. Als deze fout blijft bestaan, neem dan contact op met support via ${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
      />
      <Suspense>
        <CrispChatLoggedOutVisible />
      </Suspense>
    </>
  );
}
