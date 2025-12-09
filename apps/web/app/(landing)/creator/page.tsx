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
  title: "AI E-mail Manager voor Content Makers | Angri",
  description:
    "Stroomlijn partnerschappen en samenwerkingen. Beheer sponsoraanvragen, fanmail en samenwerkingsmogelijkheden efficiënt.",
  alternates: { canonical: "/creator" },
};

export default function CreatorPage() {
  return (
    <BasicLayout>
      <Hero
        badge="Content Makers"
        badgeVariant="blue"
        title="Stroomlijn partnerschappen en samenwerkingen"
        subtitle="Besteed meer tijd aan creëren en minder aan je inbox. Angri AI beheert sponsordeals, samenwerkingen en fan-interacties."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Herken de echte deals.
            <br />
            Negeer de spam.
          </>
        }
        subtitle="Legitieme sponsoraanbiedingen en samenwerkingsverzoeken worden gescheiden van de duizenden spammails die je dagelijks ontvangt."
      />
      <PreWrittenDrafts
        title="Professionele mediakit-antwoorden"
        subtitle="Reageer direct op merkaanvragen met je tarieven en mediakit. Onderhandel sneller met door AI opgestelde antwoorden."
      />
      <StartedInMinutes
        title="Claim je creatieve tijd terug"
        subtitle="Laat AI de zakelijke kant van je inbox regelen, zodat jij je kunt richten op het maken van content."
      />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
