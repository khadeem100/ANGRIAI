import { NextResponse } from "next/server";
import { withEmailAccount } from "@/utils/middleware";
import { createScopedLogger } from "@/utils/logger";
import prisma from "@/utils/prisma";

const logger = createScopedLogger("api/calendar-events");

export type GetCalendarEventsResponse = Awaited<
  ReturnType<typeof getCalendarEvents>
>;

export const GET = withEmailAccount("user/calendar-events", async (request) => {
  const { emailAccountId } = request.auth;
  const { searchParams } = new URL(request.url);

  const startDate = searchParams.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : new Date();
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  try {
    const events = await getCalendarEvents({
      emailAccountId,
      startDate,
      endDate,
    });
    return NextResponse.json(events);
  } catch (error) {
    logger.error("Error fetching calendar events", { error, emailAccountId });
    return NextResponse.json({ events: [] });
  }
});

async function getCalendarEvents({
  emailAccountId,
  startDate,
  endDate,
}: {
  emailAccountId: string;
  startDate: Date;
  endDate: Date;
}) {
  const emailAccount = await prisma.emailAccount.findUnique({
    where: { id: emailAccountId },
    include: {
      calendarConnections: {
        where: { isConnected: true },
        include: {
          calendars: {
            where: { isEnabled: true },
          },
        },
      },
    },
  });

  if (!emailAccount) {
    return { events: [] };
  }

  const allEvents: any[] = [];

  // For now, return sample events to demonstrate the UI
  // TODO: Implement actual calendar API integration
  const sampleEvents = [
    {
      id: "sample-1",
      title: "Team Standup",
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(9, 30, 0, 0)),
      description: "Daily team sync",
      location: "Zoom",
      attendees: ["team@company.com"],
      isOnline: true,
      calendarName: "Work Calendar",
    },
    {
      id: "sample-2",
      title: "Client Meeting",
      start: new Date(new Date().setHours(14, 0, 0, 0)),
      end: new Date(new Date().setHours(15, 0, 0, 0)),
      description: "Quarterly review",
      location: "Conference Room A",
      attendees: ["client@example.com"],
      isOnline: false,
      calendarName: "Work Calendar",
    },
  ];

  // Only show sample events if user has calendar connections
  if (emailAccount.calendarConnections.length > 0) {
    allEvents.push(...sampleEvents);
  }

  // Sort events by start time
  allEvents.sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

  return { events: allEvents };
}
