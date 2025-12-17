import { NextResponse } from "next/server";
import { z } from "zod";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { withEmailAccount } from "@/utils/middleware";
import prisma from "@/utils/prisma";
import { Prisma } from "@/generated/prisma/client";

const dashboardParams = z.object({
  days: z.coerce.number().optional().default(7),
});

export type DashboardResponse = Awaited<ReturnType<typeof getDashboardData>>;

async function getDashboardData({
  emailAccountId,
  days = 7,
}: {
  emailAccountId: string;
  days?: number;
}) {
  const now = new Date();
  const startDate = startOfDay(subDays(now, days));
  const todayStart = startOfDay(now);

  // Parallel queries for better performance
  const [
    totalEmails,
    todayEmails,
    sentEmails,
    todaySentEmails,
    threadTrackers,
    recentRules,
    topSenders,
    coldEmailsBlocked,
    newsletterStats,
    weeklyActivity,
  ] = await Promise.all([
    // Overall email stats for the period
    prisma.emailMessage.count({
      where: {
        emailAccountId,
        date: { gte: startDate },
      },
    }),

    // Today's stats
    prisma.emailMessage.count({
      where: {
        emailAccountId,
        date: { gte: todayStart },
      },
    }),

    // Sent emails in period
    prisma.emailMessage.count({
      where: {
        emailAccountId,
        date: { gte: startDate },
        sent: true,
      },
    }),

    // Today's sent emails
    prisma.emailMessage.count({
      where: {
        emailAccountId,
        date: { gte: todayStart },
        sent: true,
      },
    }),

    // Thread trackers (needs reply, awaiting reply, etc.)
    prisma.threadTracker.groupBy({
      where: {
        emailAccountId,
        resolved: false,
      },
      by: ["type"],
      _count: true,
    }),

    // Recent executed rules
    prisma.executedRule.findMany({
      where: {
        emailAccountId,
        createdAt: { gte: startDate },
        status: "APPLIED",
      },
      include: {
        rule: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Top senders this week
    prisma.$queryRaw<
      Array<{
        from: string;
        fromName: string | null;
        count: bigint;
        unreadCount: bigint;
      }>
    >`
      SELECT 
        "from",
        "fromName",
        COUNT(*)::bigint as count,
        SUM(CASE WHEN read = false THEN 1 ELSE 0 END)::bigint as "unreadCount"
      FROM "EmailMessage"
      WHERE "emailAccountId" = ${emailAccountId}
        AND date >= ${startDate}
        AND sent = false
      GROUP BY "from", "fromName"
      ORDER BY count DESC
      LIMIT 5
    `,

    // Cold emails blocked
    prisma.coldEmail.count({
      where: {
        emailAccountId,
        createdAt: { gte: startDate },
        status: "AI_LABELED_COLD",
      },
    }),

    // Newsletter stats
    prisma.newsletter.groupBy({
      where: { emailAccountId },
      by: ["status"],
      _count: true,
    }),

    // Weekly activity (last 7 days)
    prisma.$queryRaw<
      Array<{
        date: Date;
        received: bigint;
        sent: bigint;
        unread: bigint;
      }>
    >`
      SELECT 
        DATE(date) as date,
        COUNT(CASE WHEN sent = false THEN 1 END)::bigint as received,
        COUNT(CASE WHEN sent = true THEN 1 END)::bigint as sent,
        COUNT(CASE WHEN read = false THEN 1 END)::bigint as unread
      FROM "EmailMessage"
      WHERE "emailAccountId" = ${emailAccountId}
        AND date >= ${startDate}
      GROUP BY DATE(date)
      ORDER BY date ASC
    `,
  ]);

  // Calculate unread count
  const unreadCount = await prisma.emailMessage.count({
    where: {
      emailAccountId,
      read: false,
      inbox: true,
      sent: false,
    },
  });

  // Rule execution stats
  const ruleStats = await prisma.executedRule.groupBy({
    where: {
      emailAccountId,
      createdAt: { gte: startDate },
      status: "APPLIED",
    },
    by: ["ruleId"],
    _count: true,
  });

  const totalRulesExecuted = ruleStats.reduce(
    (sum, stat) => sum + stat._count,
    0,
  );

  // Get rule names for top rules
  const topRuleIds = ruleStats
    .sort((a, b) => b._count - a._count)
    .slice(0, 5)
    .map((r) => r.ruleId)
    .filter((id): id is string => id !== null);

  const topRulesWithNames = await prisma.rule.findMany({
    where: { id: { in: topRuleIds } },
    select: { id: true, name: true },
  });

  const topRules = ruleStats
    .filter((stat) => stat.ruleId && topRuleIds.includes(stat.ruleId))
    .map((stat) => ({
      name:
        topRulesWithNames.find((r) => r.id === stat.ruleId)?.name ||
        "Unknown Rule",
      count: stat._count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Thread tracker summary
  const threadTrackerSummary = {
    needsReply:
      threadTrackers.find((t) => t.type === "NEEDS_REPLY")?._count || 0,
    awaiting: threadTrackers.find((t) => t.type === "AWAITING")?._count || 0,
    needsAction:
      threadTrackers.find((t) => t.type === "NEEDS_ACTION")?._count || 0,
  };

  // Newsletter summary
  const newsletterSummary = {
    unsubscribed:
      newsletterStats.find((n) => n.status === "UNSUBSCRIBED")?._count || 0,
    autoArchived:
      newsletterStats.find((n) => n.status === "AUTO_ARCHIVED")?._count || 0,
    approved: newsletterStats.find((n) => n.status === "APPROVED")?._count || 0,
  };

  // Format weekly activity
  const formattedWeeklyActivity = weeklyActivity.map((day) => ({
    date: format(new Date(day.date), "MMM dd"),
    received: Number(day.received),
    sent: Number(day.sent),
    unread: Number(day.unread),
  }));

  // Format top senders
  const formattedTopSenders = topSenders.map((sender) => ({
    from: sender.from,
    fromName: sender.fromName,
    count: Number(sender.count),
    unreadCount: Number(sender.unreadCount),
  }));

  return {
    overview: {
      totalEmails,
      totalReceived: totalEmails - sentEmails,
      totalSent: sentEmails,
      unreadCount,
      todayEmails,
      todaySent: todaySentEmails,
    },
    aiAssistant: {
      totalRulesExecuted,
      topRules,
      recentActions: recentRules.slice(0, 5).map((rule) => ({
        id: rule.id,
        ruleName: rule.rule?.name || "Unknown Rule",
        threadId: rule.threadId,
        createdAt: rule.createdAt,
      })),
    },
    threadTrackers: threadTrackerSummary,
    coldEmailsBlocked,
    newsletters: newsletterSummary,
    topSenders: formattedTopSenders,
    weeklyActivity: formattedWeeklyActivity,
    period: {
      days,
      startDate,
      endDate: now,
    },
  };
}

export const GET = withEmailAccount("user/dashboard", async (request) => {
  const { emailAccountId } = request.auth;
  const { searchParams } = new URL(request.url);
  const params = dashboardParams.parse({
    days: searchParams.get("days"),
  });

  const data = await getDashboardData({
    emailAccountId,
    days: params.days,
  });

  return NextResponse.json(data);
});
