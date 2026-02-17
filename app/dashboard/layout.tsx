"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

import { useAdmin } from "@/lib/hooks/queries/useAuth";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, admin, checkAuth } = useAuthStore(); // Changed user to admin
  const [isMounted, setIsMounted] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keep admin data fresh and sync with store
  useAdmin(); // Changed useUser to useAdmin

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, checkAuth]);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ${
  //   isCollapsed ? "lg:ml-7" : "lg:ml-16"
  // }
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} />
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "pl-20" : "pl-64",
        )}
      >
        <Header
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          isCollapsed={isCollapsed}
        />
        <main
          className={`pt-20 p-6 py-4`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
