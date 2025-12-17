"use client";

import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  isOnline?: boolean;
  color?: string;
  calendarName?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  isLoading?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarView({ events, isLoading }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const { year, month } = useMemo(
    () => ({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    }),
    [currentDate],
  );

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [year, month]);

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const todayEvents = useMemo(() => {
    const today = new Date();
    return getEventsForDay(today).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  }, [events]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((date, index) => {
                const dayEvents = getEventsForDay(date);
                const today = isToday(date);

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-24 p-2 border rounded-lg transition-colors",
                      date ? "hover:bg-accent cursor-pointer" : "bg-muted/30",
                      today && "border-primary border-2 bg-primary/5",
                    )}
                  >
                    {date && (
                      <>
                        <div
                          className={cn(
                            "text-sm font-medium mb-1",
                            today && "text-primary font-bold",
                          )}
                        >
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                              title={event.title}
                            >
                              {formatTime(event.start)} {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Events Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Today's Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No events today</p>
                <p className="text-sm mt-1">Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="font-medium mb-2">{event.title}</div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          {event.isOnline ? (
                            <Video className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{event.attendees.length} attendees</span>
                        </div>
                      )}
                    </div>

                    {event.calendarName && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {event.calendarName}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No upcoming events</p>
              <p className="text-sm mt-1">Your calendar is clear</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events
                .filter((event) => new Date(event.start) > new Date())
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex-shrink-0 text-center">
                      <div className="text-sm font-semibold">
                        {new Date(event.start).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(event.start).getDate()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium mb-1">{event.title}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.start)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            {event.isOnline ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {event.calendarName && (
                      <Badge variant="outline" className="flex-shrink-0">
                        {event.calendarName}
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
