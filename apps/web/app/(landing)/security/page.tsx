import { BasicLayout } from "@/components/layouts/BasicLayout";
import { Section } from "@/components/new-landing/common/Section";
import {
  Heading,
  Paragraph,
  Subheading,
} from "@/components/new-landing/common/Typography";
import { CheckCircle2, Shield, Database, Lock, Server } from "lucide-react";

export const metadata = {
  title: "Beveiliging & Compliance - Angri",
  description:
    "Leer meer over hoe Angri jouw gegevens beschermt met SOC 2 compliance, encryptie en veilige infrastructuur.",
};

export default function SecurityPage() {
  return (
    <BasicLayout>
      <div className="pt-24 pb-16">
        <Section>
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <Heading className="tracking-tight">
                Beveiliging & Compliance
              </Heading>
              <Paragraph
                size="lg"
                className="text-gray-500 max-w-2xl mx-auto font-normal"
              >
                Jouw privacy en de veiligheid van je gegevens staan bij ons op
                de eerste plaats.
              </Paragraph>
            </div>

            {/* SOC 2 Section */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <Subheading className="text-2xl md:text-3xl">
                    SOC 2 Compliance
                  </Subheading>
                  <Paragraph className="text-gray-600 leading-relaxed">
                    Angri is ontworpen en gebouwd volgens de strikte SOC 2
                    (Service Organization Control 2) standaarden. Dit betekent
                    dat wij voortdurend worden gecontroleerd op de veiligheid,
                    beschikbaarheid en integriteit van onze systemen.
                  </Paragraph>
                  <ul className="space-y-3 mt-4">
                    {[
                      "Continue monitoring van infrastructuur en toegang",
                      "Strikte toegangscontrole voor medewerkers",
                      "Regelmatige beveiligingsaudits en penetratietests",
                      "Versleutelde gegevensopslag en -overdracht",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-700 font-geist text-sm md:text-base"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Infrastructure Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Database Security */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold font-geist text-gray-900">
                    Database Beveiliging
                  </h3>
                </div>
                <Paragraph className="text-gray-600 leading-relaxed">
                  Wij maken gebruik van <strong>Neon Database</strong>, een
                  toonaangevende serverless Postgres-provider. Neon biedt
                  enterprise-grade beveiliging met automatische back-ups,
                  encryptie-at-rest en isolatie van workloads.
                </Paragraph>
              </div>

              {/* Server Hardening */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Server className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold font-geist text-gray-900">
                    Infrastructuur
                  </h3>
                </div>
                <Paragraph className="text-gray-600 leading-relaxed">
                  Onze applicaties draaien op geharde servers bij{" "}
                  <strong>Hetzner</strong> in Europa (GDPR-compliant).
                  Containers zijn strikt geïsoleerd, draaien met minimale
                  privileges en worden beschermd door geavanceerde firewalls.
                </Paragraph>
              </div>
            </div>

            {/* Data Privacy */}
            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg text-blue-600">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <Subheading className="text-2xl md:text-3xl">
                    Encryptie & Privacy
                  </Subheading>
                  <Paragraph className="text-gray-700 leading-relaxed">
                    Alle gevoelige gegevens worden versleuteld verzonden (TLS
                    1.3) en opgeslagen (AES-256). Wij verkopen nooit jouw
                    gegevens aan derden. Onze AI-modellen worden getraind om
                    jouw privacy te respecteren en slaan geen persoonlijke
                    context op buiten wat nodig is voor de functionaliteit.
                  </Paragraph>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </BasicLayout>
  );
}
