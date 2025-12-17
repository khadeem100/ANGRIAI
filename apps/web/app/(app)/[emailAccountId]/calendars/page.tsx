import { PageWrapper } from "@/components/PageWrapper";
import { PageHeader } from "@/components/PageHeader";
import { CalendarConnections } from "./CalendarConnections";
import { CalendarSettings } from "./CalendarSettings";
import { ConnectCalendar } from "@/app/(app)/[emailAccountId]/calendars/ConnectCalendar";
import { TimezoneDetector } from "./TimezoneDetector";
import { CalendarViewWrapper } from "./CalendarViewWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings } from "lucide-react";

export default function CalendarsPage() {
  return (
    <PageWrapper>
      <TimezoneDetector />
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 mb-6">
        <PageHeader
          title="Calendar"
          description="View your schedule, manage connections, and let Jenn help with meeting scheduling."
        />
        <ConnectCalendar />
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarViewWrapper />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <CalendarSettings />
          <CalendarConnections />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
