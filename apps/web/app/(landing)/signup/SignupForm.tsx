"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Button as UIButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/utils/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp.email({
        email,
        password,
        name,
        callbackURL: "/welcome/business",
      }, {
        onError: (ctx) => {
            toast.error(ctx.error.message);
            setLoading(false);
        },
        onSuccess: () => {
            router.push("/welcome/business");
        }
      });
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 sm:px-16 w-full max-w-md mx-auto">
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        
        <Button size="xl" loading={loading} type="submit" className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <UIButton variant="outline" className="w-full" onClick={async () => {
            await signIn.social({
                provider: "google",
                callbackURL: "/welcome",
            });
        }}>
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
        <UIButton variant="outline" className="w-full" onClick={async () => {
            await signIn.social({
                provider: "microsoft",
                callbackURL: "/welcome",
            });
        }}>
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

      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
