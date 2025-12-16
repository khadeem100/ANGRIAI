import { EmailAccountProvider } from "@/providers/EmailAccountProvider";
import { EmailProvider } from "@/providers/EmailProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";

export default function AgentAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmailAccountProvider>
      <EmailProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
            <AppSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </SidebarProvider>
      </EmailProvider>
    </EmailAccountProvider>
  );
}
