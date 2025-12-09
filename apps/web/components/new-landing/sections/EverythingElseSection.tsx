import { BlurFade } from "@/components/new-landing/common/BlurFade";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import { DisplayCard } from "@/components/new-landing/common/DisplayCard";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  SectionHeading,
  SectionSubtitle,
} from "@/components/new-landing/common/Typography";
import { Analytics } from "@/components/new-landing/icons/Analytics";
import { ChatTwo } from "@/components/new-landing/icons/ChatTwo";
import { Link } from "@/components/new-landing/icons/Link";
import Image from "next/image";

export function EverythingElseSection() {
  return (
    <Section>
      <SectionHeading>Ontworpen rondom hoe jij werkelijk werkt</SectionHeading>
      <SectionSubtitle>
        Flexibel genoeg voor elke workflow. Simpel genoeg om in minuten op te
        zetten.
      </SectionSubtitle>
      <SectionContent
        noMarginTop
        className="mt-5 flex flex-col items-center gap-5 sm:mx-10 md:mx-40 lg:mx-0"
      >
        <CardWrapper className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5">
          <BlurFade inView>
            <DisplayCard
              title="E-mail analytics. Meten is weten"
              description="Zie wie je het meest mailt en wat je inbox vervuilt. Krijg heldere inzichten en onderneem actie."
              icon={<Analytics />}
            >
              <Image
                src="/images/new-landing/metrics.svg"
                alt="metrics"
                width={1000}
                height={400}
              />
            </DisplayCard>
          </BlurFade>
          <BlurFade delay={0.25} inView>
            <DisplayCard
              title="Concepten die je agenda kennen"
              description="Verbindt met je agenda en CRM om e-mails te schrijven op basis van je planning en klantgegevens."
              icon={<Link />}
            >
              <Image
                src="/images/new-landing/integrations.png"
                alt="App integrations"
                width={1000}
                height={400}
              />
            </DisplayCard>
          </BlurFade>
          <BlurFade delay={0.25 * 2} inView>
            <DisplayCard
              title="Gemaakt voor jouw workflow. Pas aan in begrijpelijke taal"
              description="Jouw inbox, jouw regels. Configureer alles in gewone taal. Laat het werken zoals jij werkt."
              icon={<ChatTwo />}
            >
              <Image
                src="/images/new-landing/create-rules.png"
                alt="Customize"
                width={1000}
                height={400}
              />
            </DisplayCard>
          </BlurFade>
        </CardWrapper>
      </SectionContent>
    </Section>
  );
}
