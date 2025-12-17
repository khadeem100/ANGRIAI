"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  InboxIcon,
  SettingsIcon,
  BarChart2Icon,
  UsersIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  DollarSignIcon,
  ClipboardListIcon,
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

export function HrSidebar() {
  const pathname = usePathname();
  const { emailAccountId } = useAccount();

  return (
    <Sidebar name="hr-agent-sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold">HR Manager</span>
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
                  isActive={pathname.includes("candidates")}
                >
                  <Link href={`/${emailAccountId}/candidates`}>
                    <UserPlusIcon className="mr-2 h-4 w-4" />
                    <span>Candidates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("employees")}
                >
                  <Link href={`/${emailAccountId}/employees`}>
                    <UsersIcon className="mr-2 h-4 w-4" />
                    <span>Employees</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("leave")}
                >
                  <Link href={`/${emailAccountId}/leave`}>
                    <CalendarCheckIcon className="mr-2 h-4 w-4" />
                    <span>Time Off</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("payroll")}
                >
                  <Link href={`/${emailAccountId}/payroll`}>
                    <DollarSignIcon className="mr-2 h-4 w-4" />
                    <span>Payroll & Expense</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.includes("performance")}
                >
                  <Link href={`/${emailAccountId}/performance`}>
                    <ClipboardListIcon className="mr-2 h-4 w-4" />
                    <span>Performance</span>
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
