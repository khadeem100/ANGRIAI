"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SettingsIcon,
  BarChart2Icon,
  MegaphoneIcon,
  ArrowLeftIcon,
  PencilIcon,
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

export function MarketingSidebar() {
  const pathname = usePathname();
  const { emailAccountId } = useAccount();

  return (
    <Sidebar name="marketing-agent-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold">Marketing Agent</span>
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
                    <BarChart2Icon className="mr-2 h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("campaigns")}
                >
                  <Link href={`/${emailAccountId}/campaigns`}>
                    <MegaphoneIcon className="mr-2 h-4 w-4" />
                    <span>Campaigns</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("drafts")}
                >
                  <Link href={`/${emailAccountId}/drafts`}>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    <span>Drafts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("settings")}
                >
                  <Link href={`/${emailAccountId}/settings`}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
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
