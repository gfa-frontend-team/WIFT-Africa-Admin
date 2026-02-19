"use client";

import { useEffect, useState } from "react";
import { useChapters, useChapter } from "@/lib/hooks/queries/useChapters";
import { useChapterMembers } from "@/lib/hooks/queries/useMembership";
import { User } from "@/types";
import { MemberCard } from "@/components/members/MemberCard";
import { MemberProfileModal } from "@/components/members/MemberProfileModal";
import { Search, Users as UsersIcon, Info } from "lucide-react";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PermissionGuard } from "@/lib/guards/PermissionGuard";
import { Permission } from "@/lib/constants/permissions";
import Image from "next/image";
import { getCountryIsoCode } from "@/lib/utils/countryMapping";
// import { Select } from "@/components/ui/select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export default function MembersPage() {
  const { isSuperAdmin, isChapterAdmin, userChapterId } = usePermissions();

  // Auto-scope to user's chapter for Chapter Admins
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all chapters for dropdown (Super Admin)
  const { data: chaptersResponse } = useChapters(
    { isActive: true },
    { enabled: isSuperAdmin },
  );
  const chapters = chaptersResponse?.data || [];

  // Fetch current chapter details if selected (for display name, etc.)
  const { data: currentChapter } = useChapter(selectedChapter, {
    enabled: isSuperAdmin,
  });

  // Fetch members
  const {
    data: membersResponse,
    isLoading,
    refetch,
  } = useChapterMembers(
    selectedChapter,
    1, // page
    100, // limit
  );

  const members = membersResponse?.data || [];

  // Auto-select chapter for Chapter Admin
  useEffect(() => {
    if (isChapterAdmin && userChapterId) {
      setSelectedChapter(userChapterId);
    }
  }, [isChapterAdmin, userChapterId]);

  // Filter members by search term
  const filteredMembers = members.filter((member: User) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      member.firstName?.toLowerCase().includes(search) ||
      member.lastName?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search)
    );
  });

  // console.log(chapters,"chapters")

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Members
          {isChapterAdmin && currentChapter && (
            <span className="text-primary"> - {currentChapter.name}</span>
          )}
        </h1>
        <p className="text-muted-foreground">View and manage chapter members</p>
      </div>

      {/* Chapter Admin Scope Banner */}
      {isChapterAdmin && currentChapter && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-semibold text-blue-900 dark:text-blue-300">
                Viewing Your Chapter Only
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                You are viewing members for{" "}
                <strong>{currentChapter.name}</strong> only. You cannot access
                members from other chapters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chapter Selection - Super Admin Only */}
          <PermissionGuard permission={Permission.VIEW_ALL_MEMBERS}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chapter
              </label>
              <Select
                value={selectedChapter || "all"}
                onValueChange={(value) =>
                  setSelectedChapter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full px-3 py-2 border border-input rounded-lg bg-background h-11">
                  <SelectValue placeholder="Select a chapter" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      {/* <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg shrink-0">
                        🌍
                      </div> */}
                      <span>Select a Chapter</span>
                    </div>
                  </SelectItem>

                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const flagCode = getCountryIsoCode(
                            chapter?.code,
                            chapter?.name,
                          );

                          if (flagCode === "AFRICA") {
                            return (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg shrink-0">
                                🌍
                              </div>
                            );
                          }

                          return (
                            <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full border border-border/50">
                              <Image
                                src={`https://flagsapi.com/${flagCode}/flat/64.png`}
                                alt={`${chapter?.name} flag`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src =
                                    "https://flagsapi.com/ZZ/flat/64.png"; // Fallback to unknown flag
                                }}
                                fill
                                sizes="32px"
                              />
                            </div>
                          );
                        })()}
                        <span>{chapter.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PermissionGuard>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!selectedChapter ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Please select a chapter to view members
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading members...</p>
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No members found</p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} member
              {filteredMembers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member: User) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={() => {
                  setSelectedMember(member);
                  // setIsModalOpen(true)
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Member Profile Modal */}
      <MemberProfileModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        onStatusChange={() => {
          // Refetch members
          // Since we don't have direct refetch expose from useChapterMembers (it returns generic query result)
          // ideally we invalidate query. But checking hook:
          // const { data: membersResponse, isLoading } = useChapterMembers(...)
          // standard react-query return.
          // However, simple window reload is crude.
          // Let's rely on query invalidation if we had access to queryClient, or force reload if needed.
          // Better: invalidating queries is the way.
          // BUT useMembership hook likely doesn't export the query key or client directly here.
          // I'll add queryClient usage to invalidate 'chapter-members'.
          // For now, let's try to just let React Query handle it if focus happens, or adding a key.
          // Best approach: Invalidate via QueryClient.
          // I'll need to import useQueryClient.

          // Actually, let's just create a manual refetch function wrapper if needed.
          // UseQuery returns `refetch`.
          // Let's assume useChapterMembers returns { ..., refetch }
          // I'll check lines 30-34.
          // const { data: membersResponse, isLoading } = useChapterMembers
          // I'll update that destructuring.
          refetch();
        }}
      />
    </div>
  );
}
