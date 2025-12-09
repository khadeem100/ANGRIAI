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
  title: "AI E-mailbeheer voor MKB | Angri",
  description:
    "Laat je bedrijf groeien met geautomatiseerd e-mailbeheer. Automatiseer klantenservice, factuurvragen en leverancierscommunicatie.",
  alternates: { canonical: "/small-business" },
};

export default function SmallBusinessPage() {
  return (
    <BasicLayout>
      <Hero
        badge="MKB"
        badgeVariant="green"
        title="Laat je bedrijf groeien met geautomatiseerd e-mailbeheer"
        subtitle="Laat e-mail je groei niet vertragen. Angri AI behandelt klantvragen, leverancierscoördinatie en administratieve taken."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Mis nooit meer een nieuwe lead.
            <br />
            Houd klanten tevreden.
          </>
        }
        subtitle="Belangrijke e-mails van klanten en nieuwe zakelijke kansen worden automatisch gemarkeerd. Administratieve ruis wordt gefilterd."
      />
      <PreWrittenDrafts
        title="Directe antwoorden op veelgestelde vragen"
        subtitle="Angri leert je bedrijf kennen en stelt nauwkeurige antwoorden op voor FAQ's, offerteaanvragen en het plannen van afspraken."
      />
      <StartedInMinutes
        title="Automatiseer je inbox vandaag nog"
        subtitle="Eenvoudige installatie. Directe tijdsbesparing. Focus op het laten groeien van je bedrijf."
      />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
