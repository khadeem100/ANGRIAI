import type { Metadata } from "next";
import { Testimonials } from "@/components/new-landing/sections/Testimonials";
import { Hero, HeroVideoPlayer } from "@/app/(landing)/home/Hero";
import { Pricing } from "@/components/new-landing/sections/Pricing";
import { StartedInMinutes } from "@/components/new-landing/sections/StartedInMinutes";
import { OrganizedInbox } from "@/components/new-landing/sections/OrganizedInbox";
import { PreWrittenDrafts } from "@/components/new-landing/sections/PreWrittenDrafts";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { FAQs } from "@/app/(landing)/home/FAQs";
import { FinalCTA } from "@/app/(landing)/home/FinalCTA";
import { BrandScroller } from "@/components/new-landing/BrandScroller";

export const metadata: Metadata = {
  title: "AI Klantenservice Automatisering | Angri",
  description:
    "Lever snellere ondersteuning met AI-gestuurde antwoorden. Stel directe antwoorden op voor veelgestelde vragen, ticket-triage en 24/7 responsiviteit.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <BasicLayout>
      <Hero
        badge="Klantenservice"
        badgeVariant="orange"
        title="Lever snellere ondersteuning met AI-gestuurde antwoorden"
        subtitle="Verlaag responstijden en verhoog de klanttevredenheid. Angri AI sorteert tickets en stelt 24/7 nauwkeurige antwoorden op."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Automatische ticketsortering.
            <br />
            Urgente problemen gemarkeerd.
          </>
        }
        subtitle="Binnenkomende supportverzoeken worden automatisch gecategoriseerd op urgentie en onderwerp. VIP-klanten krijgen prioriteit."
      />
      <PreWrittenDrafts
        title="Concepten op basis van je kennisbank"
        subtitle="Angri leert van je eerdere antwoorden en documentatie om nauwkeurige, behulpzame antwoorden op te stellen voor veelgestelde vragen."
      />
      <StartedInMinutes
        title="Schaal je support direct op"
        subtitle="Handel meer tickets af zonder extra personeel. Begin binnen enkele minuten."
      />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
