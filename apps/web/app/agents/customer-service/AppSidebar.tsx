"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  InboxIcon,
  SettingsIcon,
  BarChart2Icon,
  ArrowLeftIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useAccount } from "@/providers/EmailAccountProvider";
import { NavUser } from "@/components/NavUser";
import { Logo } from "@/components/Logo";

export function AppSidebar() {
  const pathname = usePathname();
  const { emailAccountId } = useAccount();

  return (
    <Sidebar name="cs-agent-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold">CS Agent</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.endsWith(emailAccountId)}
                >
                  <Link href={`/${emailAccountId}`}>
                    <InboxIcon className="mr-2 h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("rules")}
                >
                  <Link href={`/${emailAccountId}?tab=rules`}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Rules</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("history")}
                >
                  <Link href={`/${emailAccountId}?tab=history`}>
                    <BarChart2Icon className="mr-2 h-4 w-4" />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/automation`}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                <span>Back to Main App</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-2">
          <NavUser />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
