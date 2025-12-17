"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MailIcon,
  SendIcon,
  MailOpenIcon,
  SparklesIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  MailWarningIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardResponse } from "@/app/api/user/dashboard/route";
import { LoadingContent } from "@/components/LoadingContent";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAccount } from "@/providers/EmailAccountProvider";
import { RssFeedCard } from "./RssFeedCard";

export function DashboardContent() {
  const { emailAccountId } = useAccount();
  const { data, isLoading, error } = useSWR<DashboardResponse>(
    "/api/user/dashboard?days=7",
    {
      refreshInterval: 60_000, // Refresh every minute
    },
  );

  if (isLoading) return <LoadingContent />;
  if (error)
    return (
      <div className="text-destructive">Failed to load dashboard data</div>
    );
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unread Emails"
          value={data.overview.unreadCount}
          icon={MailIcon}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          subtitle="In your inbox"
        />
        <StatCard
          title="Today's Emails"
          value={data.overview.todayEmails}
          icon={MailOpenIcon}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          subtitle={`${data.overview.todaySent} sent`}
        />
        <StatCard
          title="AI Actions"
          value={data.aiAssistant.totalRulesExecuted}
          icon={SparklesIcon}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          subtitle="This week"
        />
        <StatCard
          title="Cold Emails Blocked"
          value={data.coldEmailsBlocked}
          icon={ShieldCheckIcon}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
          subtitle="This week"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Email Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="received"
                  fill="hsl(var(--primary))"
                  name="Received"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="sent"
                  fill="hsl(var(--chart-2))"
                  name="Sent"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inbox Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              Inbox Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusItem
              label="Needs Reply"
              count={data.threadTrackers.needsReply}
              color="bg-red-500"
              link={`/${emailAccountId}/mail?tab=needs-reply`}
            />
            <StatusItem
              label="Awaiting Reply"
              count={data.threadTrackers.awaiting}
              color="bg-yellow-500"
              link={`/${emailAccountId}/mail?tab=awaiting-reply`}
            />
            <StatusItem
              label="Needs Action"
              count={data.threadTrackers.needsAction}
              color="bg-blue-500"
              link={`/${emailAccountId}/mail?tab=needs-action`}
            />
          </CardContent>
        </Card>

        {/* Top AI Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5" />
                Top AI Rules
              </CardTitle>
              <Link href={`/${emailAccountId}/automation`}>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.aiAssistant.topRules.length > 0 ? (
              <div className="space-y-3">
                {data.aiAssistant.topRules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {rule.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rule.count} {rule.count === 1 ? "action" : "actions"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No rules executed yet</p>
                <Link href={`/${emailAccountId}/automation`}>
                  <Button variant="link" size="sm" className="mt-2">
                    Create your first rule
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Senders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailWarningIcon className="h-5 w-5" />
              Top Senders This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSenders.length > 0 ? (
              <div className="space-y-3">
                {data.topSenders.map((sender, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sender.fromName || sender.from}
                      </p>
                      {sender.fromName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {sender.from}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold">{sender.count}</p>
                      {sender.unreadCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {sender.unreadCount} unread
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-sm text-muted-foreground">
                No emails this week
              </p>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Newsletter Management
              </CardTitle>
              <Link href={`/${emailAccountId}/bulk-unsubscribe`}>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Unsubscribed
              </span>
              <span className="text-sm font-semibold">
                {data.newsletters.unsubscribed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Auto-archived
              </span>
              <span className="text-sm font-semibold">
                {data.newsletters.autoArchived}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Approved</span>
              <span className="text-sm font-semibold">
                {data.newsletters.approved}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Actions */}
      {data.aiAssistant.recentActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Recent AI Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.aiAssistant.recentActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SparklesIcon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{action.ruleName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(action.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/${emailAccountId}/mail?threadId=${action.threadId}`}
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RSS Feed - Latest Updates */}
      <RssFeedCard />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({
  label,
  count,
  color,
  link,
}: {
  label: string;
  count: number;
  color: string;
  link: string;
}) {
  return (
    <Link href={link}>
      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-semibold">{count}</span>
      </div>
    </Link>
  );
}
