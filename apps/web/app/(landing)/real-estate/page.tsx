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
  title: "AI E-mailbeheer voor Makelaars | Angri",
  description:
    "AI-e-mailbeheer voor vastgoedprofessionals. Handel leadaanvragen, het plannen van bezichtigingen en klantcommunicatie automatisch af.",
  alternates: { canonical: "/real-estate" },
};

export default function RealEstatePage() {
  return (
    <BasicLayout>
      <Hero
        badge="Vastgoed"
        badgeVariant="pink"
        title="AI-e-mailbeheer voor vastgoedprofessionals"
        subtitle="Sluit meer deals door sneller te reageren. Angri AI beheert nieuwe leads, bezichtigingsaanvragen en klantopvolgingen direct."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Nieuwe leads vooraan.
            <br />
            Mis nooit meer een bezichtigingsaanvraag.
          </>
        }
        subtitle="Aanvragen van Funda, Pararius en directe leads worden geprioriteerd. Admin-meldingen worden opgeborgen."
      />
      <PreWrittenDrafts
        title="Plan bezichtigingen automatisch"
        subtitle="Wanneer een klant een woning wil zien, stelt Angri een antwoord op met je beschikbaarheid of planningslink."
      />
      <StartedInMinutes
        title="Begin meer deals te sluiten"
        subtitle="Installatie duurt enkele minuten. Begin vandaag nog sneller te reageren op leads dan je concurrentie."
      />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
