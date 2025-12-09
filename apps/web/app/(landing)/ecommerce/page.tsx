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
  title: "AI E-mailautomatisering voor E-commerce | Angri",
  description:
    "Automatiseer bestelupdates en klantcommunicatie. Handel bestelstatusvragen, retouren en productvragen efficiënt af.",
  alternates: { canonical: "/ecommerce" },
};

export default function EcommercePage() {
  return (
    <BasicLayout>
      <Hero
        badge="E-commerce"
        badgeVariant="blue"
        title="Automatiseer bestelupdates en klantcommunicatie"
        subtitle="Beheer de inbox van je winkel op de automatische piloot. Angri AI verwerkt direct bestelvragen, retouren en productvragen."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Scheid bestellingen van vragen.
            <br />
            Herken urgente problemen.
          </>
        }
        subtitle="Bestelmeldingen, updates van leveranciers en klantvragen worden automatisch georganiseerd. Urgente verzendproblemen worden gemarkeerd."
      />
      <PreWrittenDrafts
        title="Directe antwoorden op bestelstatus"
        subtitle='"Waar is mijn bestelling?" krijgt direct een conceptantwoord met trackinginfo. Retourverzoeken krijgen standaardprocedure-antwoorden klaar om te verzenden.'
      />
      <StartedInMinutes
        title="Automatiseer de operatie van je winkel"
        subtitle="Maak tijd vrij voor marketing en product. Laat AI de klantenservice-e-mails afhandelen."
      />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
