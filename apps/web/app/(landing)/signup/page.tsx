import { SignupForm } from "./SignupForm";
import { AuthPageSignup } from "@/components/ui/auth-page-signup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Angri",
  description: "Create your Angri account",
};

export default function SignupPage() {
  return <AuthPageSignup />;
}
