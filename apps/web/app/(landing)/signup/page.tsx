import { SignupForm } from "./SignupForm";
import { SquaresPattern } from "@/app/(landing)/home/SquaresPattern";
import { PageHeading, TypographyP } from "@/components/Typography";
import { CardBasic } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Angri",
  description: "Create your Angri account",
};

export default function SignupPage() {
  return (
    <div className="flex flex-col justify-center px-6 py-20 text-gray-900 min-h-screen">
      <SquaresPattern />

      <CardBasic className="mx-auto flex max-w-2xl flex-col justify-center space-y-6 p-10 duration-500 animate-in fade-in bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col text-center space-y-2">
          <PageHeading>Create an account</PageHeading>
          <TypographyP>Get started with Angri for Business</TypographyP>
        </div>

        <SignupForm />
      </CardBasic>
    </div>
  );
}
