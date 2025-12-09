import type { Metadata } from "next";
import { Testimonials } from "@/components/new-landing/sections/Testimonials";
import { Hero, HeroVideoPlayer } from "@/app/(landing)/home/Hero";
import { Pricing } from "@/components/new-landing/sections/Pricing";
import { Awards } from "@/components/new-landing/sections/Awards";
import { EverythingElseSection } from "@/components/new-landing/sections/EverythingElseSection";
import { StartedInMinutes } from "@/components/new-landing/sections/StartedInMinutes";
import { BulkUnsubscribe } from "@/components/new-landing/sections/BulkUnsubscribe";
import { OrganizedInbox } from "@/components/new-landing/sections/OrganizedInbox";
import { PreWrittenDrafts } from "@/components/new-landing/sections/PreWrittenDrafts";
import { BasicLayout } from "@/components/layouts/BasicLayout";
import { FAQs } from "@/app/(landing)/home/FAQs";
import { FinalCTA } from "@/app/(landing)/home/FinalCTA";
import { WordReveal } from "@/components/new-landing/common/WordReveal";
import { BrandScroller } from "@/components/new-landing/BrandScroller";
import { WelcomePopup } from "@/components/new-landing/WelcomePopup";

export const metadata: Metadata = {
  title: "Angri - #1 AI Email Assistent | Bereik Inbox Zero in Minuten",
  description:
    "Stop met verdrinken in e-mail. Angri gebruikt geavanceerde AI om je inbox te organiseren, e-mails automatisch te beantwoorden en spam te verwijderen. Probeer het gratis.",
  keywords: [
    // Core Product
    "AI email assistent",
    "inbox zero",
    "email management software",
    "email automatisering",
    "automatisch beantwoorden",
    "email opruimen",

    // Features
    "automatisch uitschrijven",
    "nieuwsbrieven beheren",
    "koude email blokkeren",
    "AI email schrijver",
    "email templates",
    "bulk archiveren",

    // Audience/Niche
    "email voor ondernemers",
    "email voor bedrijven",
    "email productiviteit",
    "zakelijke email tool",

    // Brand & Tech
    "angri",
    "angri ai",
    "tynktech",
    "nederlandse AI software",
    "veilig emailen",
    "AVG proof email tool",
    "privacy first email",
  ],
  alternates: { canonical: "https://angri.nl" },
  openGraph: {
    title: "Angri - #1 AI Email Assistent | Bereik Inbox Zero in Minuten",
    description:
      "Stop met verdrinken in e-mail. Angri gebruikt geavanceerde AI om je inbox te organiseren, e-mails automatisch te beantwoorden en spam te verwijderen.",
    url: "https://angri.nl",
    siteName: "Angri AI",
    locale: "nl_NL",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Angri AI Email Assistent Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Angri - #1 AI Email Assistent",
    description:
      "Bereik Inbox Zero met Angri. Automatiseer je e-mails en bespaar uren per week.",
    creator: "@inboxzero_ai", // Consider changing to @angri_ai if applicable
    images: ["/opengraph-image.png"],
  },
};

export default function NewLanding() {
  return (
    <BasicLayout>
      <WelcomePopup />
      <Hero
        title={
          <WordReveal
            spaceBetween="w-2 md:w-3"
            words={[
              "Maak",
              "kennis",
              "met",
              <em key="ANGRI">ANGRI,</em>,
              "de",
              "AI-emailassistent",
              "die",
              <em key="actually">werkelijk</em>,
              "voor",
              "je",
              "werkt",
            ]}
          />
        }
        subtitle="Angri AI organiseert je inbox, stelt antwoorden op in jouw stem, en helpt je snel inbox zero te bereiken. Mis nooit meer een belangrijke e-mail."
      >
        <HeroVideoPlayer />
        <BrandScroller />
      </Hero>
      <OrganizedInbox
        title={
          <>
            Automatisch georganiseerd.
            <br />
            Mis nooit meer een belangrijke e-mail.
          </>
        }
        subtitle="Verdrink je in e-mails? Verspil geen energie aan het prioriteren. Onze AI-assistent labelt alles automatisch."
      />
      <PreWrittenDrafts
        title="Voorgeschreven concepten wachten in je inbox"
        subtitle="Wanneer je je inbox checkt, heeft elke e-mail die een antwoord nodig heeft al een concept klaarstaan in jouw toon, klaar om te verzenden."
      />
      <StartedInMinutes
        title="Begin binnen enkele minuten"
        subtitle="Installatie met één klik. Begin binnen enkele minuten met organiseren en antwoorden."
      />
      <BulkUnsubscribe />
      <EverythingElseSection />
      <Awards />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <FAQs />
    </BasicLayout>
  );
}
