"use client";

import { useEffect, useState } from "react";
import { CalendarView } from "./CalendarView";
import { useAccount } from "@/providers/EmailAccountProvider";
import { fetchWithAccount } from "@/utils/fetch";
import type { GetCalendarEventsResponse } from "@/app/api/user/calendar-events/route";
import { toastError } from "@/components/Toast";

export function CalendarViewWrapper() {
  const { emailAccountId } = useAccount();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAccount({
          url: "/api/user/calendar-events",
          emailAccountId,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch calendar events");
        }

        const data: GetCalendarEventsResponse = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
        toastError({
          title: "Error loading calendar",
          description: "Could not load calendar events. Please try again.",
        });
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [emailAccountId]);

  return <CalendarView events={events} isLoading={isLoading} />;
}
