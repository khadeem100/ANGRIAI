"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getEmailTerminology } from "@/utils/terminology";
import {
  AlertCircleIcon,
  ArchiveIcon,
  ArrowLeftIcon,
  BarChartBigIcon,
  BookIcon,
  BrushIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
  FileIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  HomeIcon,
  InboxIcon,
  type LucideIcon,
  MailIcon,
  MailsIcon,
  MegaphoneIcon,
  MessagesSquareIcon,
  PenIcon,
  PersonStandingIcon,
  PlugIcon,
  RatioIcon,
  SendIcon,
  SettingsIcon,
  SparklesIcon,
  StickyNoteIcon,
  TagIcon,
  Users2Icon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useComposeModal } from "@/providers/ComposeModalProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenu,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SetupProgressCard } from "@/components/SetupProgressCard";
import { SideNavMenu } from "@/components/SideNavMenu";
import { CommandShortcut } from "@/components/ui/command";
import { useSplitLabels } from "@/hooks/useLabels";
import { LoadingContent } from "@/components/LoadingContent";
import { useCleanerEnabled } from "@/hooks/useFeatureFlags";
import { ClientOnly } from "@/components/ClientOnly";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { useAccount } from "@/providers/EmailAccountProvider";
import { prefixPath } from "@/utils/path";
import { ReferralDialog } from "@/components/ReferralDialog";
import { isGoogleProvider } from "@/utils/email/provider-types";
import { NavUser } from "@/components/NavUser";
import { PremiumCard } from "@/components/PremiumCard";
import { useInstalledIntegrations } from "@/hooks/useInstalledIntegrations";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon | (() => React.ReactNode);
  target?: "_blank";
  count?: number;
  hideInMail?: boolean;
};

export const useNavigation = () => {
  // When we have features in early access, we can filter the navigation items
  const showCleaner = useCleanerEnabled();
  const { emailAccountId, emailAccount, provider } = useAccount();
  const currentEmailAccountId = emailAccount?.id || emailAccountId;

  // Assistant category items
  const navItems: NavItem[] = useMemo(
    () => [
      {
        name: "Dashboard",
        href: prefixPath(currentEmailAccountId, "/dashboard"),
        icon: HomeIcon,
      },
      {
        name: "Email Assistant",
        href: prefixPath(currentEmailAccountId, "/assistant"),
        icon: SparklesIcon,
      },
      {
        name: "Calendar",
        href: prefixPath(currentEmailAccountId, "/calendars"),
        icon: CalendarIcon,
      },
      {
        name: "AI Automation",
        href: prefixPath(currentEmailAccountId, "/automation"),
        icon: MessagesSquareIcon,
      },
      {
        name: "Mail Analytics",
        href: prefixPath(currentEmailAccountId, "/stats"),
        icon: BarChartBigIcon,
      },
      {
        name: "App Store",
        href: prefixPath(currentEmailAccountId, "/integrations"),
        icon: BookIcon,
      },
      {
        name: "To-Do",
        href: prefixPath(currentEmailAccountId, "/todos"),
        icon: StickyNoteIcon,
      },
      {
        name: "Downloads",
        href: prefixPath(currentEmailAccountId, "/downloads"),
        icon: DownloadIcon,
      },
      {
        name: "Workforce",
        href: prefixPath(currentEmailAccountId, "/workforce"),
        icon: Users2Icon,
      },
      {
        name: "Courses",
        href: prefixPath(currentEmailAccountId, "/courses"),
        icon: GraduationCapIcon,
      },
    ],
    [currentEmailAccountId, provider],
  );

  const navItemsFiltered = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.href === `/${emailAccountId}/clean` || item.href === "/clean")
          return showCleaner;
        return true;
      }),
    [showCleaner, emailAccountId, navItems],
  );

  return {
    navItems: navItemsFiltered,
  };
};

const topMailLinks: NavItem[] = [
  {
    name: "Inbox",
    icon: InboxIcon,
    href: "?type=inbox",
  },
  {
    name: "Concepten",
    icon: FileIcon,
    href: "?type=draft",
  },
  {
    name: "Verzonden",
    icon: SendIcon,
    href: "?type=sent",
  },
  {
    name: "Gearchiveerd",
    icon: ArchiveIcon,
    href: "?type=archive",
  },
];

const bottomMailLinks: NavItem[] = [
  {
    name: "Persoonlijk",
    icon: PersonStandingIcon,
    href: "?type=CATEGORY_PERSONAL",
  },
  {
    name: "Sociaal",
    icon: Users2Icon,
    href: "?type=CATEGORY_SOCIAL",
  },
  {
    name: "Updates",
    icon: AlertCircleIcon,
    href: "?type=CATEGORY_UPDATES",
  },
  {
    name: "Forums",
    icon: MessagesSquareIcon,
    href: "?type=CATEGORY_FORUMS",
  },
  {
    name: "Reclame",
    icon: RatioIcon,
    href: "?type=CATEGORY_PROMOTIONS",
  },
];

export function SideNav({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigation = useNavigation();
  const { emailAccountId, emailAccount } = useAccount();
  const currentEmailAccountId = emailAccount?.id || emailAccountId;
  const path = usePathname();
  const showMailNav = path.includes("/mail") || path.includes("/compose");
  const { installedIntegrations, isLoading: integrationsLoading } =
    useInstalledIntegrations();

  const visibleBottomLinks = useMemo(
    () =>
      showMailNav
        ? [
            {
              name: "Terug",
              href: "/automation",
              icon: ArrowLeftIcon,
            },
          ]
        : [],
    [showMailNav],
  );

  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="gap-0 pb-0">
        {state.includes("left-sidebar") ? (
          <div className="flex items-center rounded-md pl-2 pr-0.5 py-3 text-foreground justify-between">
            <Link href="/setup">
              <Logo className="h-3.5" />
            </Link>
            <SidebarTrigger name="left-sidebar" />
          </div>
        ) : (
          <div className="pb-2">
            <SidebarTrigger name="left-sidebar" />
          </div>
        )}
        <AccountSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {state.includes("left-sidebar") ? <SetupProgressCard /> : null}

        <SidebarGroupContent>
          {showMailNav ? (
            <MailNav path={path} />
          ) : (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SideNavMenu items={navigation.navItems} activeHref={path} />
              </SidebarGroup>

              {/* Installed Integrations Section */}
              {installedIntegrations.length > 0 && (
                <SidebarGroup>
                  <SidebarGroupLabel>Integrations</SidebarGroupLabel>
                  <SidebarMenu>
                    {installedIntegrations.map((integration) => (
                      <SidebarMenuItem key={integration.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={path.includes(
                            `/integrations/${integration.name}`,
                          )}
                        >
                          <Link
                            href={prefixPath(
                              currentEmailAccountId,
                              `/integrations/${integration.name}`,
                            )}
                          >
                            {integration.logo ? (
                              <div className="size-4 flex items-center justify-center">
                                <Image
                                  src={integration.logo}
                                  alt={integration.displayName}
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <PlugIcon className="size-4" />
                            )}
                            <span className="truncate">
                              {integration.displayName}
                            </span>
                            {integration.isActive && (
                              <span className="ml-auto size-2 rounded-full bg-green-500" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              )}
            </>
          )}
        </SidebarGroupContent>
      </SidebarContent>

      <PremiumCard isCollapsed={!state.includes("left-sidebar")} />

      <SidebarFooter className="pb-4">
        <ClientOnly>
          <ReferralDialog />
        </ClientOnly>

        <SidebarMenuButton asChild>
          <Link href="https://docs.angri.nl" target="_blank">
            <BookIcon className="size-4" />
            <span className="font-semibold">Help Center</span>
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton asChild>
          <Link href={prefixPath(currentEmailAccountId, "/settings")}>
            <SettingsIcon className="size-4" />
            <span className="font-semibold">Instellingen</span>
          </Link>
        </SidebarMenuButton>

        <SideNavMenu items={visibleBottomLinks} activeHref={path} />

        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

function MailNav({ path }: { path: string }) {
  const { onOpen } = useComposeModal();
  const [showHiddenLabels, setShowHiddenLabels] = useState(false);
  const { visibleLabels, hiddenLabels, isLoading } = useSplitLabels();
  const { provider } = useAccount();
  const terminology = getEmailTerminology(provider);

  // Transform user labels into NavItems
  const labelNavItems = useMemo(() => {
    const searchParams = new URLSearchParams(path.split("?")[1] || "");
    const currentLabelId = searchParams.get("labelId");

    return visibleLabels.map((label) => ({
      name: label.name ?? "",
      icon: TagIcon,
      href: `?type=label&labelId=${encodeURIComponent(label.id ?? "")}`,
      // Add active state for the current label
      active: currentLabelId === label.id,
    }));
  }, [visibleLabels, path]);

  // Transform hidden labels into NavItems
  const hiddenLabelNavItems = useMemo(() => {
    const searchParams = new URLSearchParams(path.split("?")[1] || "");
    const currentLabelId = searchParams.get("labelId");

    return hiddenLabels.map((label) => ({
      name: label.name ?? "",
      icon: TagIcon,
      href: `?type=label&labelId=${encodeURIComponent(label.id ?? "")}`,
      // Add active state for the current label
      active: currentLabelId === label.id,
    }));
  }, [hiddenLabels, path]);

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-9 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={onOpen}
              sidebarName="left-sidebar"
            >
              <PenIcon className="size-4" />
              <span className="truncate font-semibold">Opstellen</span>
              <CommandShortcut>C</CommandShortcut>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SideNavMenu items={topMailLinks} activeHref={path} />
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>Categorieën</SidebarGroupLabel>
        <SideNavMenu items={bottomMailLinks} activeHref={path} />
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>
          {terminology.label.pluralCapitalized}
        </SidebarGroupLabel>
        <LoadingContent loading={isLoading}>
          {visibleLabels.length > 0 ? (
            <SideNavMenu items={labelNavItems} activeHref={path} />
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Geen {terminology.label.plural}
            </div>
          )}

          {/* Hidden labels toggle */}
          {hiddenLabels.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowHiddenLabels(!showHiddenLabels)}
                className="flex w-full items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {showHiddenLabels ? (
                  <ChevronDownIcon className="mr-1 size-4" />
                ) : (
                  <ChevronRightIcon className="mr-1 size-4" />
                )}
                <span>Meer</span>
              </button>

              {showHiddenLabels && (
                <SideNavMenu items={hiddenLabelNavItems} activeHref={path} />
              )}
            </>
          )}
        </LoadingContent>
      </SidebarGroup>
    </>
  );
}
