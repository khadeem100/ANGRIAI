"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Button as UIButton } from "@/components/ui/button";
import { SectionDescription } from "@/components/Typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signIn } from "@/utils/auth-client";
import { WELCOME_PATH } from "@/utils/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const error = searchParams?.get("error");

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    await signIn.email(
      {
        email,
        password,
        callbackURL: next && next.length > 0 ? next : WELCOME_PATH,
      },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoadingEmail(false);
        },
        onSuccess: () => {
          // Redirect handled by callbackURL
          setLoadingEmail(false);
        },
      },
    );
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    await signIn.social({
      provider: "google",
      errorCallbackURL: "/login/error",
      callbackURL: next && next.length > 0 ? next : WELCOME_PATH,
      ...(error === "RequiresReconsent" ? { consent: true } : {}),
    });
    setLoadingGoogle(false);
  };

  const handleMicrosoftSignIn = async () => {
    setLoadingMicrosoft(true);
    await signIn.social({
      provider: "microsoft",
      errorCallbackURL: "/login/error",
      callbackURL: next && next.length > 0 ? next : WELCOME_PATH,
      ...(error === "RequiresReconsent" ? { consent: true } : {}),
    });
    setLoadingMicrosoft(false);
  };

  return (
    <div className="flex flex-col justify-center gap-4 px-4 sm:px-16">
      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Wachtwoord</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button size="xl" loading={loadingEmail} type="submit">
          Inloggen
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Of ga verder met
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <UIButton variant="outline" className="w-full">
              <Image
                src="/images/google.svg"
                alt="Google"
                width={16}
                height={16}
                className="mr-2"
                unoptimized
              />
              Google
            </UIButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inloggen</DialogTitle>
            </DialogHeader>
            <SectionDescription>
              Het gebruik en de overdracht door Angri AI van informatie
              ontvangen van Google API's aan een andere app voldoet aan het{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                className="underline underline-offset-4 hover:text-gray-900"
              >
                Google API Services User Data
              </a>{" "}
              Policy, inclusief de Limited Use-vereisten.
            </SectionDescription>
            <div>
              <Button loading={loadingGoogle} onClick={handleGoogleSignIn}>
                Ik ga akkoord
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <UIButton
          variant="outline"
          className="w-full"
          loading={loadingMicrosoft}
          onClick={handleMicrosoftSignIn}
        >
          <Image
            src="/images/microsoft.svg"
            alt="Microsoft"
            width={16}
            height={16}
            className="mr-2"
            unoptimized
          />
          Microsoft
        </UIButton>
      </div>

      <UIButton
        variant="ghost"
        size="lg"
        className="w-full hover:scale-105 transition-transform mt-2"
        asChild
      >
        <Link href="/login/sso">Inloggen met SSO</Link>
      </UIButton>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Of</span>
        </div>
      </div>

      <UIButton variant="outline" size="lg" className="w-full" asChild>
        <Link href="/signup">Account aanmaken met E-mail</Link>
      </UIButton>
    </div>
  );
}
