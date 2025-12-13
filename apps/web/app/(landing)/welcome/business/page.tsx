import { BusinessOnboardingForm } from "./BusinessOnboardingForm";
import { SquaresPattern } from "@/app/(landing)/home/SquaresPattern";
import { PageHeading, TypographyP } from "@/components/Typography";
import { CardBasic } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Setup - Angri",
  description: "Set up your business profile",
};

export default function BusinessWelcomePage() {
  return (
    <div className="flex flex-col justify-center px-6 py-20 text-gray-900 min-h-screen">
      <SquaresPattern />

      <CardBasic className="mx-auto flex max-w-2xl flex-col justify-center space-y-6 p-10 duration-500 animate-in fade-in bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col text-center space-y-2">
          <PageHeading>Welcome to Angri Business</PageHeading>
          <TypographyP>Let's tailor your workspace.</TypographyP>
        </div>

        <BusinessOnboardingForm />
      </CardBasic>
    </div>
  );
}
