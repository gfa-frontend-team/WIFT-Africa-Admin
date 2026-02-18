"use client";

import {
  LogOut,
  Bell,
  Shield,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/lib/hooks/usePermissions";
import {  useLogout } from "@/lib/hooks/queries/useAuth";
import { useChapter } from "@/lib/hooks/queries/useChapters";
import { getCountryIsoCode } from "@/lib/utils/countryMapping";
import Image from "next/image";
import { ModeToggle } from "../shared/ModeToggle";
import { cn } from "@/lib/utils";

export function Header({
  toggleSidebar,
  isCollapsed,
}: {
  toggleSidebar: () => void;
  isCollapsed: boolean;
}) {
  const { admin } = useAuthStore(); // Changed user to admin

  const { isSuperAdmin, isChapterAdmin } = usePermissions();


  // Fetch chapter details if user is Chapter Admin
  const { data: chapter } = useChapter(admin?.chapterId || "", {
    enabled: !!admin?.chapterId && isChapterAdmin,
    isAdminView: true, // Use admin endpoint to get full chapter details
  });

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };


console.log("data",admin)
  return (
   <header className={cn(
  "h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 right-0 z-2 transition-all duration-300",
  isCollapsed ? "left-20" : "left-64"
)}>
      <div className="flex-1">
        {/* User Info with Role Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500 "
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
          </button>

          <div className="flex items-center gap-2">
            {(() => {
              const flagCode = getCountryIsoCode(
                chapter?.code,
                chapter?.country,
              );
              if (flagCode === "AFRICA") {
                return (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg">
                    🌍
                  </div>
                );
              }

              return (
                <div className="relative w-12 h-12 shrink-0 overflow-hidden ">
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
                    sizes="48px"
                    fill
                  />
                </div>
              );
            })()}
            {/* Fallback initials (hidden by default, shown if flag fails) */}
            {isChapterAdmin && chapter && (
              <div className="hidden items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-semibold text-sm">
                {admin?.firstName?.[0]}{admin?.lastName?.[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {isChapterAdmin && chapter
                  ? chapter.name
                  : `${admin?.firstName} ${admin?.lastName}`}
              </p>
              <p className="text-xs text-muted-foreground">{admin?.email}</p>
            </div>
          </div>

          {/* Role Badge */}
          {isSuperAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              <Shield className="w-3 h-3" />
              Super Admin
            </span>
          )}
          {isChapterAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              <Shield className="w-3 h-3" />
              Chapter Admin
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        <ModeToggle />

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
}
