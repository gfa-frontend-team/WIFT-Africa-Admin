"use client";

import { useEffect, useMemo } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores";
import {
  useChapterStatistics,
  useChapter,
  useMemberTrend,
} from "@/lib/hooks/queries/useChapters";
import { useVerificationStats } from "@/lib/hooks/queries/useVerification";
import { analyticsApi } from "@/lib/api/analytics";
import {
  PostAnalyticsSummary,
  ConnectionAnalytics,
  ChapterDashboardStats,
} from "@/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { useState } from "react";
import Link from "next/link";
import { useProfileCountContext } from "@/lib/hooks/useDetails";
import { StatCardSkeleton } from "@/components/StatCardSkeleton";

export default function DashboardPage() {
  const { admin } = useAuthStore(); // Changed user to admin

  // const {chapterId,role} = useProfileCountContext()

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const isChapterAdmin = admin?.role === "CHAPTER_ADMIN";

  // Super Admin Stats
  const { data: statistics, isLoading: isStatsLoading } = useChapterStatistics({
    enabled: isSuperAdmin,
  });

  // Chapter Admin Data (Keep for name/details)
  const { data: currentChapter, isLoading: isChapterLoading } = useChapter(
    isChapterAdmin ? admin?.chapterId || "" : "",
  );

  // Analytics Data
  const [analytics, setAnalytics] = useState<{
    posts: PostAnalyticsSummary | null;
    connections: ConnectionAnalytics | null;
    chapterStats: ChapterDashboardStats | null;
  }>({ posts: null, connections: null, chapterStats: null });

  const { data, isLoading: isTrending } = useMemberTrend();

  const { viewCount, dataLoading } = useProfileCountContext();

  // console.log(viewCount,"viewCount")

  const memberStats = useMemo(() => {
    // Accessing the nested data from your response structure
    const stats = data?.data?.trend;

    if (!stats) return { current: 0, trend: null };

    return {
      current: stats.newThisMonth || 0,
      trend: {
        // Formatting 3700 to "3,700%" or just "3700%"
        value: `${stats.growthPercentage.toLocaleString()}%`,
        // It's positive if growth is >= 0
        isPositive: stats.growthPercentage >= 0,
      },
    };
  }, [data]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        if (isSuperAdmin) {
          const [postsData, connectionsData] = await Promise.all([
            analyticsApi.getPostSummary(),
            analyticsApi.getTotalConnections(),
          ]);
          setAnalytics((prev) => ({
            ...prev,
            posts: postsData,
            connections: connectionsData,
          }));
        } else if (isChapterAdmin) {
          const stats = await analyticsApi.getChapterDashboardStats();
          setAnalytics((prev) => ({ ...prev, chapterStats: stats }));
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    }
    fetchAnalytics();
  }, [isSuperAdmin, isChapterAdmin]);

  const isLoading =
    (isSuperAdmin && isStatsLoading) ||
    (isChapterAdmin && isChapterLoading) ||
    dataLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Super Admin Dashboard
  // if (false) {
  if (isSuperAdmin) {
    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {admin?.firstName} {admin?.lastName}!
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading || isTrending ? (
            // Render 4 skeletons while loading
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Chapters"
                value={statistics?.totalChapters || 0}
                icon={Building2}
                href="/dashboard/chapters"
              />
              <StatCard
                title="Total Members"
                value={statistics?.totalMembers || 0}
                icon={Users}
                href="/dashboard/members"
              />
              <StatCard
                title="Member Growth"
                value={memberStats.current}
                trend={memberStats.trend || undefined}
                icon={TrendingUp}
              />
              <StatCard
                title="Total Impressions"
                value={analytics.posts?.totalImpressions.toLocaleString() || 0}
                icon={Globe}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {[
                {
                  href: "/dashboard/chapters/new",
                  icon: Building2,
                  title: "Create New Chapter",
                  description: "Add a new regional chapter",
                },
                {
                  href: "/dashboard/requests",
                  icon: UserCheck,
                  title: "Review Requests",
                  description: "Approve or reject membership requests",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Platform Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Chapters
                </span>
                <span className="text-sm font-medium text-foreground">
                  {statistics?.activeChapters || 0} /{" "}
                  {statistics?.totalChapters || 0}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${statistics?.totalChapters ? (statistics.activeChapters / statistics.totalChapters) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  Inactive Chapters
                </span>
                <span className="text-sm font-medium text-foreground">
                  {statistics?.inactiveChapters || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chapter Admin Dashboard
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Chapter Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {admin?.firstName} {admin?.lastName}!
        </p>
        {currentChapter && (
          <p className="text-lg font-semibold text-primary mt-2">
            {currentChapter.name}
          </p>
        )}
      </div>

      {/* Chapter Statistics */}
      {analytics.chapterStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Members"
            value={analytics.chapterStats.totalMembers}
            icon={Users}
            href="/dashboard/members"
          />
          <StatCard
            title="Pending Approvals"
            value={analytics.chapterStats.pendingApprovals}
            icon={UserCheck}
            href="/dashboard/requests"
            trend={
              analytics.chapterStats.pendingApprovals > 0
                ? {
                    value: "Pending",
                    isPositive: false, // Red color to indicate urgency
                  }
                : undefined
            }
            className={
              analytics.chapterStats.pendingApprovals > 0
                ? "border-amber-500/50"
                : ""
            }
          />
          {/* Growth Metrics Card */}
          <StatCard
            title="Monthly Growth"
            value={`${analytics.chapterStats.growth.percentageChange}%`}
            icon={Activity}
            trend={{
              value:
                analytics.chapterStats.growth.trend === "STABLE"
                  ? "Stable"
                  : "This Month",
              isPositive: analytics.chapterStats.growth.trend === "UP",
            }}
          />
          <StatCard
            title="Chapter Profile View"
            value={viewCount.count || 0}
            icon={Globe}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              {
                href: "/dashboard/requests",
                icon: UserCheck,
                title: "Review Requests",
                description: "Approve or reject membership requests",
              },
              {
                href: "/dashboard/members",
                icon: Users,
                title: "View Members",
                description: "See all approved chapter members",
              },
              {
                href: "/dashboard/my-chapter",
                icon: Building2,
                title: "View Chapter Details",
                description: "See your chapter information",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Chapter Information
          </h2>
          {currentChapter ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Chapter Name</p>
                <p className="font-medium text-foreground">
                  {currentChapter.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">
                  {currentChapter.city ? `${currentChapter.city}, ` : ""}
                  {currentChapter.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentChapter.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                  }`}
                >
                  {currentChapter.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Loading chapter information...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
