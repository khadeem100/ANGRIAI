import { Card, CardContent } from "@/components/new-landing/common/Card";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import {
  Paragraph,
  SectionHeading,
  SectionSubtitle,
} from "@/components/new-landing/common/Typography";
import { cn } from "@/utils";
import Image from "next/image";

type Award = {
  title: string;
  description: string;
  image: string;
  imageSize?: number;
  top?: string;
  hideOnMobile?: boolean;
};

const awards: Award[] = [
  {
    title: "SOC2 Gecertificeerd",
    description:
      "Beveiliging op enterprise-niveau. SOC 2 Type 2 gecertificeerd",
    image: "/images/new-landing/awards/soc-award.png",
  },
  {
    title: "#1 Product Hunt",
    description: "Product van de Dag op Product Hunt",
    image: "/images/new-landing/awards/product-hunt-award.png",
    imageSize: 170,
  },
];

const defaultAwardImageSize = 200;

export function Awards() {
  return (
    <Section>
      <SectionHeading>Privacy eerst</SectionHeading>
      <SectionSubtitle>
        Jouw data blijft privé — geen AI-training, geen gekke dingen. We zijn
        volledig gecertificeerd voor top-tier beveiliging, en je kunt Angri
        zelfs zelf hosten als je volledige controle wilt.
      </SectionSubtitle>
      <SectionContent
        noMarginTop
        className="mt-20 gap-x-5 gap-y-20 lg:gap-y-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      >
        {awards.map((award, i) => (
          <CardWrapper
            padding="sm"
            rounded="sm"
            key={award.title}
            className={cn(
              award.hideOnMobile && "hidden md:block",
              // place first award in column 2 and second award in column 3 on large screens
              i === 0 && "lg:col-start-2 lg:col-end-3",
              i === 1 && "lg:col-start-3 lg:col-end-4",
            )}
          >
            <Card
              variant="extra-rounding"
              className="gap-3 h-full relative pt-24 text-center"
            >
              <CardContent>
                <Image
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 -translate-y-20",
                    award.top || "top-0",
                  )}
                  src={award.image}
                  alt={award.title}
                  width={award.imageSize || defaultAwardImageSize}
                  height={award.imageSize || defaultAwardImageSize}
                />
                <Paragraph color="gray-900" size="md" className="font-bold">
                  {award.title}
                </Paragraph>
                <Paragraph size="sm" className="mt-4">
                  {award.description}
                </Paragraph>
              </CardContent>
            </Card>
          </CardWrapper>
        ))}
      </SectionContent>
    </Section>
  );
}
