import { Anchor } from "@/components/new-landing/common/Anchor";
import { Card, CardContent } from "@/components/new-landing/common/Card";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  Paragraph,
  SectionHeading,
} from "@/components/new-landing/common/Typography";
import { env } from "@/env";

const faqs = [
  {
    question: "Welke e-mailproviders ondersteunt Angri?",
    answer:
      "We ondersteunen Gmail, Google Workspace en Microsoft Outlook. We werken hard aan het toevoegen van meer providers.",
  },
  {
    question: "Hoe kan ik een functie aanvragen?",
    answer: (
      <span>
        Mail ons of meld een issue op{" "}
        <Anchor href="/contact" newTab>
          onze rapportage-pagina
        </Anchor>
        . We horen graag hoe we jouw e-mailervaring kunnen verbeteren.
      </span>
    ),
  },
  {
    question: "Vervangt Angri mijn huidige e-mailprogramma?",
    answer:
      "Nee! Angri is geen e-mailprogramma. Je gebruikt het naast je huidige client. Je kunt Google of Outlook gewoon blijven gebruiken.",
  },
  {
    question: "Is de code open-source?",
    answer: (
      <span>
        Nee! Maar je kunt contact opnemen met onze{" "}
        <Anchor href="http://www.tynktech.nl" newTab>
          sales-afdeling
        </Anchor>{" "}
        voor een enterprise-licentie om Angri op je eigen omgeving te hosten.
      </span>
    ),
  },
  {
    question: "Bieden jullie refunds aan?",
    answer: (
      <span>
        Ja, als je vindt dat we geen waarde hebben toegevoegd, stuur ons dan een{" "}
        <Anchor href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>mail</Anchor>{" "}
        binnen 14 dagen na het upgraden en we storten je geld terug.
      </span>
    ),
  },
  {
    question: "Kan ik Angri gratis proberen?",
    answer:
      "Absoluut, we hebben een gratis proefperiode van 14 dagen op al onze abonnementen, zodat je het direct kunt proberen, zonder creditcard!",
  },
];

export function FAQs() {
  return (
    <Section>
      <SectionHeading>Veelgestelde vragen</SectionHeading>
      <SectionContent>
        <CardWrapper>
          <dl className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <Card
                variant="extra-rounding"
                className="gap-4"
                key={faq.question}
              >
                <CardContent>
                  <Paragraph
                    as="dt"
                    color="gray-900"
                    className="font-semibold tracking-tight mb-4"
                  >
                    {faq.question}
                  </Paragraph>
                  <dd>
                    <Paragraph>{faq.answer}</Paragraph>
                  </dd>
                </CardContent>
              </Card>
            ))}
          </dl>
        </CardWrapper>
      </SectionContent>
    </Section>
  );
}
