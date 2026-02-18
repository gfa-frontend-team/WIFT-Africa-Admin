"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores";
import { useChapter } from "@/lib/hooks/queries/useChapters";
import {
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  UserCheck,
  LayoutDashboard,
  Edit,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ChapterEditModal } from "@/components/chapters/ChapterEditModal";
import Link from "next/link";
import { Separator } from "@/components/ui/Separator";

export default function MyChapterPage() {
  const router = useRouter();
  const { admin } = useAuthStore(); // Changed user to admin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch chapter details using the safe endpoint (defaults to isAdminView: false)
  const { data: currentChapter, isLoading } = useChapter(
    admin?.chapterId ? admin.chapterId : "",
    { enabled: !!admin?.chapterId },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  // If after loading we still don't have a chapter (and not loading), show empty state
  if (!currentChapter) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Chapter Assigned</h1>
        <p className="text-muted-foreground">
          You are not currently assigned to manage any chapter.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ChapterEditModal
        chapter={currentChapter}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Chapter
            </h1>
            <p className="text-muted-foreground">
              View and manage your chapter information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Chapter
            </Button>
          </div>
        </div>

        {/* Chapter Name and Status */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {currentChapter.name}
          </h2>
          <Badge variant={currentChapter.isActive ? "success" : "default"}>
            {currentChapter.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-muted-foreground">{currentChapter.code}</p>
      </div>

      {/* Stats */}
      {currentChapter.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-foreground">
                {currentChapter.stats.total}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {currentChapter.stats.approved}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {currentChapter.stats.pending}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {currentChapter.stats.rejected}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-5 pb-5">
            <Link
              href="/dashboard/requests"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <UserCheck className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">
                Review Requests
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Approve or reject membership requests
              </p>
            </Link>
            <Link
              href="/dashboard/members"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Users className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">
                View Members
              </p>
              <p className="text-xs text-muted-foreground text-center">
                See all approved chapter members
              </p>
            </Link>
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">
                Dashboard
              </p>
              <p className="text-xs text-muted-foreground text-center">
                View chapter statistics
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Section 1: Key Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="flex gap-3">
                <div className="p-2 h-fit rounded-lg bg-primary/10">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {currentChapter.city ? `${currentChapter.city}, ` : ""}
                    {currentChapter.country}
                  </p>
                </div>
              </div>

              {/* Founded Date */}
              {currentChapter.foundedDate && (
                <div className="flex gap-3">
                  <div className="p-2 h-fit rounded-lg bg-primary/10">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Founded
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(currentChapter.foundedDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="opacity-50" />

            {/* Section 2: Membership Info */}
            <div className="flex gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
              <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="grid grid-cols-2 gap-8 w-full">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    System Count
                  </p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {currentChapter.memberCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Public Display
                  </p>
                  <p className="text-lg font-bold text-foreground leading-tight">
                    {currentChapter.fixedMemberCount &&
                    currentChapter.fixedMemberCount > 0 ? (
                      currentChapter.fixedMemberCount
                    ) : (
                      <span className="text-sm font-normal text-muted-foreground italic">
                        Sync'd
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Text Blocks */}
            <div className="space-y-4">
              {currentChapter.description && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {currentChapter.description}
                  </p>
                </div>
              )}

              {currentChapter.missionStatement && (
                <div className="space-y-1 p-3 rounded-lg border-l-2 border-primary bg-primary/5">
                  <h4 className="text-sm font-semibold text-primary">
                    Mission Statement
                  </h4>
                  <p className="text-sm italic leading-relaxed text-foreground/80">
                    {`"${currentChapter.missionStatement}"`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
       <CardContent className="space-y-6 p-6">
  {/* President Profile Section */}
  {currentChapter.currentPresident && (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Chapter President</p>
          <p className="text-sm font-bold text-foreground">{currentChapter.currentPresident}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2 pl-[3.25rem]">
        {currentChapter.presidentEmail && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <a href={`mailto:${currentChapter.presidentEmail}`} className="hover:text-primary transition-colors">
              {currentChapter.presidentEmail}
            </a>
          </div>
        )}
        {currentChapter.presidentPhone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{currentChapter.presidentPhone}</span>
          </div>
        )}
      </div>
    </div>
  )}

  {/* General Contact Links */}
  <div className="space-y-3 px-1">
    {currentChapter.email && (
      <div className="flex items-center gap-3 group">
        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
          <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </div>
        <a href={`mailto:${currentChapter.email}`} className="text-sm font-medium hover:underline text-foreground">
          {currentChapter.email}
        </a>
      </div>
    )}

    {currentChapter.phone && (
      <div className="flex items-center gap-3 group">
        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
          <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">{currentChapter.phone}</span>
      </div>
    )}

    {currentChapter.website && (
      <div className="flex items-center gap-3 group">
        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
          <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
        </div>
        <a 
          href={currentChapter.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline text-primary truncate max-w-[240px]"
        >
          {currentChapter.website.replace(/^https?:\/\//, '')}
        </a>
      </div>
    )}
  </div>

  {/* Address Section */}
  {currentChapter.address && (
    <div className="pt-2 border-t border-border/50">
      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-1">Office Address</p>
      <div className="flex gap-3 px-1">
        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed text-foreground/90">
          {currentChapter.address}
        </p>
      </div>
    </div>
  )}
</CardContent>
        </Card>
      </div>
    </div>
  );
}
