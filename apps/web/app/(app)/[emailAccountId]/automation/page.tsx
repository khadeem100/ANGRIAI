"use client";

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { PageHeader } from "@/components/PageHeader";
import { AboutSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/AboutSetting";
import { DigestSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/DigestSetting";
import { DraftReplies } from "@/app/(app)/[emailAccountId]/assistant/settings/DraftReplies";
import { DraftKnowledgeSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/DraftKnowledgeSetting";
import { ReferralSignatureSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/ReferralSignatureSetting";
import { LearnedPatternsSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/LearnedPatternsSetting";
import { PersonalSignatureSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/PersonalSignatureSetting";
import { MultiRuleSetting } from "@/app/(app)/[emailAccountId]/assistant/settings/MultiRuleSetting";
import { Rules } from "@/app/(app)/[emailAccountId]/assistant/Rules";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bot, Sparkles, Brain, Zap, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "@/providers/EmailAccountProvider";
import { fetchWithAccount } from "@/utils/fetch";

export const maxDuration = 300;

export default function AutomationPage() {
  const { emailAccountId } = useAccount();
  const [learningStatus, setLearningStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLearningStatus = async () => {
    if (!emailAccountId) return;

    try {
      const res = await fetchWithAccount({
        url: "/api/user/ai-learning-consent",
        emailAccountId,
      });
      const data = await res.json();
      setLearningStatus(data.consent ?? false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching learning status:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (emailAccountId) {
      fetchLearningStatus();

      // Poll every 5 seconds to keep in sync
      const interval = setInterval(fetchLearningStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [emailAccountId]);

  return (
    <PageWrapper>
      <div className="mb-6">
        <PageHeader
          title="Email Assistant Settings"
          description="Configure Jenn, your AI email assistant, to work exactly how you want."
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jenn</div>
            <p className="text-xs text-muted-foreground">
              Your intelligent email assistant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Status
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${learningStatus ? "text-green-600" : "text-gray-400"}`}
                >
                  {learningStatus ? "Active" : "Disabled"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {learningStatus
                    ? "Continuously improving"
                    : "Not collecting data"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Enabled</div>
            <p className="text-xs text-muted-foreground">
              Rules and smart actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic settings for your email assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AboutSetting />
              <PersonalSignatureSetting />
              <ReferralSignatureSetting />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Rules</CardTitle>
              <CardDescription>
                Manage automation rules that Jenn uses to organize and process
                your emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Rules />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Settings</CardTitle>
              <CardDescription>
                Control how Jenn drafts email replies for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DraftReplies />
              <DraftKnowledgeSetting />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning & Intelligence</CardTitle>
              <CardDescription>
                Configure how Jenn learns from your emails and improves over
                time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LearnedPatternsSetting />
              <DigestSetting />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure automation rules and multi-rule execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiRuleSetting />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              About Jenn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Jenn is your intelligent email assistant powered by AI. She helps
              you:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-primary" />
                <span>Draft personalized email replies</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="h-4 w-4 mt-0.5 text-primary" />
                <span>Automate email organization with smart rules</span>
              </li>
              <li className="flex items-start gap-2">
                <Brain className="h-4 w-4 mt-0.5 text-primary" />
                <span>Learn from your email patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="h-4 w-4 mt-0.5 text-primary" />
                <span>Manage your inbox efficiently</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Drafting</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Rules</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pattern Learning</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-categorization</span>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
