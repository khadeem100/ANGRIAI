import { CallToAction } from "@/components/new-landing/CallToAction";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  SectionHeading,
  SectionSubtitle,
} from "@/components/new-landing/common/Typography";

export function FinalCTA() {
  return (
    <div
      className="bg-[url('/images/new-landing/buy-back-time-bg.png')] bg-cover bg-center bg-no-repeat"
      style={{ backgroundPosition: "center 44%" }}
    >
      <Section>
        <SectionHeading>
          Win een uur per dag terug.
          <br />
          Begin met Angri AI.
        </SectionHeading>
        <SectionSubtitle>
          Minder tijd in je inbox. Meer tijd voor wat er werkelijk toe doet.
        </SectionSubtitle>
        <SectionContent>
          <CallToAction text="Begin gratis" buttonSize="lg" className="mt-6" />
        </SectionContent>
      </Section>
    </div>
  );
}
