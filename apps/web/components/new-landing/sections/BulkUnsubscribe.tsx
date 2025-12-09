import Image from "next/image";
import {
  Section,
  SectionContent,
} from "@/components/new-landing/common/Section";
import { CardWrapper } from "@/components/new-landing/common/CardWrapper";
import {
  SectionHeading,
  SectionSubtitle,
} from "@/components/new-landing/common/Typography";

export function BulkUnsubscribe() {
  return (
    <Section>
      <SectionHeading>
        Snel een opgeruimde inbox.
        <br />
        Schrijf je in bulk uit voor e-mails die je nooit leest.
      </SectionHeading>
      <SectionSubtitle>
        Zie welke e-mails je nooit leest, en schrijf je met één klik uit en
        archiveer ze.
      </SectionSubtitle>
      <SectionContent className="flex justify-center items-center">
        <CardWrapper
          padding="xs"
          rounded="md"
          className="hidden md:block md:mx-20 lg:mx-40 xl:mx-52"
        >
          <Image
            src="/images/new-landing/bulk-unsubscribe.png"
            alt="bulk unsubscribe"
            width={1000}
            height={1000}
          />
        </CardWrapper>
        <div className="flex flex-col gap-2">
          <CardWrapper padding="xs" rounded="md" className="block md:hidden">
            <Image
              src="/images/new-landing/bulk-unsubscribe-mobile.png"
              alt="bulk unsubscribe"
              width={1000}
              height={1000}
            />
          </CardWrapper>
        </div>
      </SectionContent>
    </Section>
  );
}
