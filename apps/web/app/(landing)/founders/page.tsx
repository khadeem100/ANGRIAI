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
  title: "AI E-mailassistent voor Founders | Angri",
  description:
    "Schaal je startup terwijl Angri AI je inbox beheert. Geautomatiseerde investeerdersupdates, partnercommunicatie en planning.",
  alternates: { canonical: "/founders" },
};

export default function FoundersPage() {
  return (
    <BasicLayout>
      <Hero
        badge="Voor Founders"
        badgeVariant="purple"
        title="Schaal je startup terwijl AI je inbox beheert"
        subtitle="Focus op het bouwen van je product en het spreken met gebruikers. Angri AI beheert investeerdersupdates, partnercommunicatie en planning."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Prioriteer wat belangrijk is.
            <br />
            Filter de ruis.
          </>
        }
        subtitle="Investeerders en belangrijke partners gaan rechtstreeks naar je prioriteitsmap. Nieuwsbrieven en koude acquisitie blijven uit de weg."
      />
      <PreWrittenDrafts
        title="Pitchdeck-antwoorden klaar voor verzending"
        subtitle="Mis nooit meer een investeerdersaanvraag. Angri stelt automatisch professionele antwoorden op voor pitchdeck-verzoeken en plannings-e-mails."
      />
      <StartedInMinutes
        title="Ga binnen enkele minuten weer aan het bouwen"
        subtitle="Installatie met één klik. Begin binnen enkele minuten met organiseren en antwoorden."
      />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
