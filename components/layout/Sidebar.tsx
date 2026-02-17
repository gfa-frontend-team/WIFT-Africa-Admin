"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Settings,
  Shield,
  AlertCircle,
  Calendar,
  ShieldAlert,
  BarChart3,
  MessageSquarePlus,
  Radio,
  Banknote,
  Briefcase,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";
import { useChapter } from "@/lib/hooks/queries/useChapters";
import { getCountryIsoCode } from "@/lib/utils/countryMapping";
import { useState } from "react";

const superAdminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chapters", href: "/dashboard/chapters", icon: Building2 },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Mentorships", href: "/dashboard/mentorships", icon: GraduationCap },
  { name: "Grants & Funds", href: "/dashboard/funding", icon: Banknote },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Membership Requests", href: "/dashboard/requests", icon: UserCheck },
  { name: "Members", href: "/dashboard/members", icon: Users },
  {
    name: "Verification Delays",
    href: "/dashboard/verification",
    icon: AlertCircle,
  },
  { name: "Reports", href: "/dashboard/reports", icon: ShieldAlert },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
  { name: "Moderation", href: "/dashboard/posts", icon: Radio },
  { name: "Broadcasts", href: "/dashboard/messages", icon: MessageSquarePlus },
  // { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const chapterAdminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Chapter", href: "/dashboard/my-chapter", icon: Building2 },
  { name: "Broadcasts", href: "/dashboard/messages", icon: MessageSquarePlus },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Mentorships", href: "/dashboard/mentorships", icon: GraduationCap },
  { name: "Grants & Funds", href: "/dashboard/funding", icon: Banknote },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Membership Requests", href: "/dashboard/requests", icon: UserCheck },
  { name: "Members", href: "/dashboard/members", icon: Users },
  // { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const { admin } = useAuthStore();

  const [isHovered, setIsHovered] = useState(false);

  // It is "expanded" if the user hasn't collapsed it OR if they are hovering
  const isExpanded = !isCollapsed || isHovered;

  // Fetch chapter details if user is Chapter Admin
  const { data: chapter } = useChapter(admin?.chapterId || "", {
    enabled: !!admin?.chapterId && admin.role === "CHAPTER_ADMIN",
    isAdminView: true, // Use admin endpoint to get full chapter details
  });

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const navigation = isSuperAdmin
    ? superAdminNavigation
    : chapterAdminNavigation;

  const getRoleBadge = () => {
    if (admin?.role === "SUPER_ADMIN") {
      return {
        text: "Super Admin",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
    }
    if (admin?.role === "CHAPTER_ADMIN") {
      return {
        text: "Chapter Admin",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      };
    }
    return null;
  };

  // const roleBadge = getRoleBadge()

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border h-screen fixed left-0 top-0 z-5 transition-all duration-300",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-border",
        isExpanded ? "gap-3 px-6 py-5" : "justify-center px-2 py-5"
      )}>
        <div className={cn(
          "relative rounded-lg overflow-hidden",
          isExpanded ? "w-30 h-10" : "w-10 h-10"
        )}>
          <Image
            src="/logo.jpg"
            alt="WIFT Africa Logo"
            fill
            className={cn(
              "object-cover transition-all",
              !isExpanded && "scale-150" // Zoom in slightly when collapsed to make logo more visible
            )}
          />
        </div>
      </div>

      {/* Role Badge */}
      {/* {roleBadge && isExpanded && (
        <div className="px-6 py-3">
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleBadge.color)}>
            {roleBadge.text}
          </span>
        </div>
      )} */}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Special handling for dashboard root to avoid matching all /dashboard/* routes
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                isExpanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2",
                isActive
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              title={!isExpanded ? item.name : undefined} // Show tooltip when collapsed
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isExpanded && item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={cn(
        "border-t border-border",
        isExpanded ? "px-3 py-4" : "px-2 py-4"
      )}>
        <div className={cn(
          "flex items-center rounded-lg bg-accent",
          isExpanded ? "gap-3 px-3 py-2" : "justify-center px-2 py-2"
        )}>
          {(() => {
            const flagCode = getCountryIsoCode(chapter?.code, chapter?.country);
            if (flagCode === "AFRICA") {
              return (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg shrink-0">
                  🌍
                </div>
              );
            }

            return (
              <div className="relative w-8 h-8 shrink-0 overflow-hidden">
                <Image
                  src={`https://flagsapi.com/${flagCode}/flat/64.png`}
                  alt={`${chapter?.country} flag`}
                  className="w-8 h-8 rounded-full object-cover border border-border/50"
                  onError={(e) => {
                    // Fallback to initials if flag fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                  sizes="32px"
                  width={32}
                  height={32}
                />
              </div>
            );
          })()}
          
          {/* Fallback initials (hidden by default, shown if flag fails) */}
          {admin?.role === "CHAPTER_ADMIN" && chapter && (
            <div className="hidden items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-medium shrink-0">
              {admin?.firstName?.[0]}
              {admin?.lastName?.[0]}
            </div>
          )}
          
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {admin?.role === "CHAPTER_ADMIN" && chapter
                  ? chapter.name
                  : `${admin?.firstName} ${admin?.lastName}`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin?.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
