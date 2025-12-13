import type { Metadata } from "next";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { Button } from "@/components/new-landing/common/Button";
import Link from "next/link";
import {
  CheckIcon,
  XIcon,
  ShieldCheckIcon,
  PuzzleIcon,
  WalletIcon,
  ZapIcon,
} from "lucide-react";
import {
  PageHeading,
  Paragraph,
  Subheading,
  SectionHeading,
} from "@/components/new-landing/common/Typography";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import { Card, CardContent } from "@/components/new-landing/common/Card";

export const metadata: Metadata = {
  title: "Best Fyxer Alternative | Angri AI (Jenn)",
  description:
    "Why Angri AI is the smarter, faster, and more private alternative to Fyxer for email management.",
};

export default function BestFyxerAlternativePage() {
  return (
    <BasicLayout>
      {/* Hero Section */}
      <Section className="mt-10 md:mt-20">
        <PageHeading>The Sovereign Alternative to Fyxer</PageHeading>
        <Paragraph size="lg" className="max-w-[640px] mx-auto mt-6">
          Stop waiting for human assistants. Switch to{" "}
          <strong>Jenn (Angri AI)</strong>—the private, self-hosted AI that
          manages your inbox instantly, securely, and at a fraction of the cost.
        </Paragraph>
        <SectionContent
          noMarginTop
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button size="xl" asChild>
            <Link href="/signup">Get Started with Angri</Link>
          </Button>
          <Button variant="secondary" size="xl" asChild>
            <Link href="#comparison">See Comparison</Link>
          </Button>
        </SectionContent>
      </Section>

      {/* Comparison Table */}
      <Section
        id="comparison"
        className="bg-gray-50 rounded-3xl py-12 px-4 sm:px-8"
      >
        <SectionHeading>Angri AI vs. Fyxer</SectionHeading>
        <Paragraph className="mt-4">
          Why businesses are switching to sovereign AI.
        </Paragraph>

        <SectionContent className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-center text-xl font-bold text-blue-600 font-title"
                  >
                    Angri AI (Jenn)
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-center text-lg font-semibold text-gray-500"
                  >
                    Fyxer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 text-left">
                    Privacy & Data
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-700 bg-blue-50/50 rounded-lg">
                    <span className="font-bold text-blue-700 block">
                      Sovereign & Self-Hosted
                    </span>
                    Your data never leaves your infrastructure
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                    <span className="font-bold block">Shared Access</span>
                    Humans/Cloud AI read your emails
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 text-left">
                    Response Time
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-green-600 font-bold">
                    Instant (Real-time)
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-gray-500">
                    Minutes to Hours (Human delay)
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 text-left">
                    Cost
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-700 bg-blue-50/50 rounded-lg">
                    <span className="font-bold text-blue-700 block">
                      Fixed Software Cost
                    </span>
                    Affordable monthly/annual plans
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-500">
                    <span className="font-bold block">Service Fees</span>
                    Expensive hourly or high retainer
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 text-left">
                    Integrations
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-gray-700">
                    Deep (Odoo, Stripe, PrestaShop)
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-gray-500">
                    Limited / Manual
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0 text-left">
                    Availability
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-green-600 font-bold">
                    24/7/365
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-gray-500">
                    Business Hours
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionContent>
      </Section>

      {/* Deep Dive Sections */}
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <Subheading className="text-2xl md:text-3xl">
                Sovereign Privacy
              </Subheading>
            </div>
            <Paragraph size="lg" className="mb-6">
              Fyxer relies on human assistants reading your emails or
              cloud-based processing.
              <strong> Angri AI (Jenn)</strong> is different. We offer
              self-hosted capabilities where the AI runs entirely on your own
              infrastructure.
            </Paragraph>
            <Paragraph size="lg">
              This means for Tynk Tech VOF and our clients, absolute data
              sovereignty. No third-party eyes on your sensitive business
              communications.
            </Paragraph>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 font-title text-xl">
              The Privacy Gap
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                <Paragraph color="gray-700">
                  Angri: Local LLM (Ollama) support
                </Paragraph>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                <Paragraph color="gray-700">
                  Angri: Zero data retention option
                </Paragraph>
              </li>
              <li className="flex items-start gap-3">
                <XIcon className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                <Paragraph color="gray-500">
                  Fyxer: Humans sign NDAs (but still see data)
                </Paragraph>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-24 text-left">
          <div className="order-2 md:order-1 bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 font-title text-xl">
              Business Automation
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                <Paragraph color="gray-700">
                  "Jenn, check if this customer paid in Stripe"
                </Paragraph>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                <Paragraph color="gray-700">
                  "Create a sales order in Odoo for this request"
                </Paragraph>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                <Paragraph color="gray-700">
                  "Sync stock levels from PrestaShop"
                </Paragraph>
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <PuzzleIcon className="w-6 h-6" />
              </div>
              <Subheading className="text-2xl md:text-3xl">
                Real Integrations
              </Subheading>
            </div>
            <Paragraph size="lg" className="mb-6">
              An executive assistant is only as good as the tools they can use.
              Fyxer assistants struggle with complex ERPs and databases without
              extensive training.
            </Paragraph>
            <Paragraph size="lg">
              Jenn connects directly to your{" "}
              <strong>Stripe, Odoo, and PrestaShop</strong> backends. She
              doesn't just draft emails; she performs business logic, checks
              payments, and manages orders instantly.
            </Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-24 text-left">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <WalletIcon className="w-6 h-6" />
              </div>
              <Subheading className="text-2xl md:text-3xl">
                Cost Efficiency
              </Subheading>
            </div>
            <Paragraph size="lg" className="mb-6">
              Human assistance is premium. Fyxer provides great service, but at
              a high monthly cost that scales with hours worked.
            </Paragraph>
            <Paragraph size="lg">
              Angri AI is software. You pay a predictable flat fee (or nothing
              for the self-hosted tier) for <strong>unlimited</strong> usage. No
              overtime, no holidays, no hourly metering.
            </Paragraph>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 font-title text-xl">
              Monthly Cost Comparison
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Fyxer (Standard)</span>
                  <span>£1,500+ / mo</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gray-500 h-2.5 rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span className="text-blue-600">Angri AI (Pro)</span>
                  <span className="text-blue-600">€25 / mo</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: "5%" }}
                  />
                </div>
              </div>
              <Paragraph size="xs" color="gray-500" className="mt-2">
                *Estimated costs for comparative purposes.
              </Paragraph>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="mb-20">
        <div className="rounded-3xl bg-blue-600 px-6 py-16 sm:px-12 sm:py-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-title">
              Ready to upgrade your workflow?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join the businesses that have switched from manual assistants to
              sovereign AI. Secure, fast, and owned by Tynk Tech VOF.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Link
                href="/login"
                className="text-sm font-semibold leading-6 text-white hover:text-blue-50 transition-colors"
              >
                Log in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </BasicLayout>
  );
}
