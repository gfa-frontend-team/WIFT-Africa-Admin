

"use client";
import { useAuthStore } from "@/lib/stores";
import { AdminRole } from "@/types";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useChapterViewCount } from "./queries/useChapters";

// 1. Define a clear Type for the context
interface ProfileContextType {
  viewCount: {count:number};
  dataLoading: boolean;
//   userChapterId: string | undefined;
//   timeframe: "30days" | "90days";
//   setTimeframe: (val: "30days" | "90days") => void;
//   user: any;
//   isAuthenticated: boolean;
chapterId: string | null | undefined; // Add null here
  role: AdminRole | null | undefined;
} 

// 2. Initial State
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
   const { admin } = useAuthStore(); // Changed user to admin

  const { data: viewCount, isLoading: dataLoading } = useChapterViewCount(
    admin?.chapterId as string,
    true
  );

  const value = useMemo(() => ({
    // viewCount: viewCount ?? { count: 0, viewers: [] },
    // isReady: dataLoading,
    chapterId: admin?.chapterId,
    role:admin?.role,
    viewCount,
    dataLoading
    // isAuthenticated,
    // user,
    // timeframe,
    // setTimeframe
  }), [admin,viewCount,dataLoading]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// 4. Hook with built-in error checking
export function useProfileCountContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfileCountContext must be used within a ProfileProvider");
  }
  return context;
}