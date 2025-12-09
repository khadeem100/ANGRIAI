import type { Metadata } from "next";
import Link from "next/link";
import { SectionDescription, TypographyH3 } from "@/components/Typography";
import { Footer } from "@/app/(landing)/home/Footer";
import { FinalCTA } from "@/app/(landing)/home/FinalCTA";
import { CardBasic } from "@/components/ui/card";
import {
  PageHeading,
  Paragraph,
} from "@/components/new-landing/common/Typography";
import { Button } from "@/components/new-landing/common/Button";
import { BlogHeader } from "@/components/layouts/BlogLayout";

export const metadata: Metadata = {
  title: "Vrienden | Angri",
  description: "Andere geweldige Open Source projecten om te volgen",
  alternates: { canonical: "/oss-friends" },
};

type OSSFriend = {
  href: string;
  name: string;
  description: string;
};

export default async function OSSFriendsPage() {
  try {
    const res = await fetch("https://formbricks.com/api/oss-friends");
    const data: { data: OSSFriend[] } = await res.json();

    return (
      <>
        <BlogHeader />

        <div className="mx-auto mt-20 max-w-6xl pb-10">
          <div className="text-center">
            <PageHeading>Open Source Vrienden</PageHeading>
            <Paragraph className="mt-4">
              Andere geweldige Open Source projecten om te volgen
            </Paragraph>
          </div>
          <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data?.map((friend) => {
              return (
                <CardBasic key={friend.name}>
                  <TypographyH3>
                    <Link href={friend.href}>{friend.name}</Link>
                  </TypographyH3>
                  <SectionDescription className="mt-4">
                    {friend.description}
                  </SectionDescription>
                  <div className="mt-4">
                    <Button asChild>
                      <Link href={friend.href} target="_blank">
                        Meer info
                      </Link>
                    </Button>
                  </div>
                </CardBasic>
              );
            })}
          </div>
        </div>

        <FinalCTA />
        <Footer />
      </>
    );
  } catch (error) {
    console.error(error);
    return <div>Fout bij laden van OSS Vrienden</div>;
  }
}
