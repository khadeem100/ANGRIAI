import {
  SparklesIcon,
  Users2Icon,
  BriefcaseIcon,
  MegaphoneIcon,
  HeadphonesIcon,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prefixPath } from "@/utils/path";

const AGENTS = [
  {
    id: "customer-service",
    name: "Customer Service Agent",
    description:
      "Manage your inbox, automate replies, and organize customer communication.",
    icon: HeadphonesIcon,
    href: "/workforce/customer-service",
    status: "active",
    badge: "Installed",
  },
  {
    id: "hr",
    name: "HR Manager",
    description:
      "Screen resumes, schedule interviews, and handle employee onboarding tasks.",
    icon: Users2Icon,
    href: "/workforce/hr",
    status: "coming_soon",
    badge: "Coming Soon",
  },
  {
    id: "finance",
    name: "Finance Analyst",
    description:
      "Process invoices, track expenses, and generate financial reports.",
    icon: BriefcaseIcon,
    href: "/workforce/finance",
    status: "coming_soon",
    badge: "Coming Soon",
  },
  {
    id: "marketing",
    name: "Marketing Specialist",
    description:
      "Draft newsletters, manage social media, and analyze campaign performance.",
    icon: MegaphoneIcon,
    href: "/workforce/marketing",
    status: "coming_soon",
    badge: "Coming Soon",
  },
];

export default async function WorkforcePage({
  params,
}: {
  params: Promise<{ emailAccountId: string }>;
}) {
  const { emailAccountId } = await params;

  return (
    <PageWrapper>
      <PageHeader
        title="AI Workforce"
        description="Hire specialized AI agents to handle different parts of your business."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {AGENTS.map((agent) => (
          <Card
            key={agent.id}
            className="flex flex-col h-full hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <agent.icon className="size-6 text-primary" />
                </div>
                <Badge
                  variant={agent.status === "active" ? "default" : "secondary"}
                >
                  {agent.badge}
                </Badge>
              </div>
              <CardTitle className="text-xl">{agent.name}</CardTitle>
              <CardDescription className="mt-2">
                {agent.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              {agent.status === "active" ? (
                <Button asChild className="w-full">
                  <Link
                    href={prefixPath(
                      emailAccountId,
                      agent.href as `/${string}`,
                    )}
                  >
                    Manage Agent
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full" variant="outline">
                  Not Available Yet
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
