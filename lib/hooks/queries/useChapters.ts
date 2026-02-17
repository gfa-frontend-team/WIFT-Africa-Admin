import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chaptersApi, ChapterFilters, CreateChapterData } from '@/lib/api/chapters'
import { API_BASE_URL } from '@/lib/env'

export const CHAPTER_KEYS = {
  all: ['chapters'] as const,
  lists: () => [...CHAPTER_KEYS.all, 'list'] as const,
  list: (filters: ChapterFilters = {}) => [...CHAPTER_KEYS.lists(), filters] as const,
  details: () => [...CHAPTER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CHAPTER_KEYS.details(), id] as const,
  countries: ['chapters', 'countries'] as const,
  statistics: ['chapters', 'statistics'] as const,
}

export function useChapterStatistics(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: CHAPTER_KEYS.statistics,
    queryFn: chaptersApi.getStatistics,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options.enabled,
  })
}

export function useChapters(filters: ChapterFilters, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: CHAPTER_KEYS.list(filters),
    queryFn: () => chaptersApi.getChapters(filters),
    placeholderData: (previousData) => previousData,
    enabled: options.enabled,
  })
}

export function useChapter(id: string, options: { enabled?: boolean; isAdminView?: boolean } = {}) {
  const { isAdminView = false, enabled = true } = options
  
  return useQuery({
    queryKey: CHAPTER_KEYS.detail(id),
    // Switch between Admin API (Full stats) and Public/Member API (Basic details)
    queryFn: () => isAdminView 
      ? chaptersApi.getChapter(id)
      : chaptersApi.getChapterDetails(id),
    enabled: !!id && enabled,
  })
}

export function useCountries() {
    return useQuery({
        queryKey: CHAPTER_KEYS.countries,
        queryFn: chaptersApi.getCountries,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours (countries rarely change)
    })
}

export function useCreateChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChapterData) => chaptersApi.createChapter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.lists() })
    },
  })
}

export function useUpdateChapter(isAdminView: boolean = false) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateChapterData> }) =>
      isAdminView
        ? chaptersApi.updateChapter(id, data)
        : chaptersApi.updateChapterDetails(id, data),
    onSuccess: (updatedChapter) => {
      queryClient.setQueryData(CHAPTER_KEYS.detail(updatedChapter.id), (oldData: any) => {
          // If we have full details, merge; otherwise just return updated
          if(oldData && oldData.stats) {
              return { ...updatedChapter, stats: oldData.stats }
          }
          return updatedChapter
      })
      queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.lists() })
    },
  })
}

export function useDeactivateChapter() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: chaptersApi.deactivateChapter,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.lists() })
            queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.detail(id) })
        }
    })
}

export function useReactivateChapter() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: chaptersApi.reactivateChapter,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.lists() })
            queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.detail(id) })
        }
    })
}

export function useAddChapterAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, userId }: { chapterId: string; userId: string }) =>
      chaptersApi.addChapterAdmin(chapterId, userId),
    onSuccess: (_, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.detail(chapterId) })
    },
  })
}

export function useRemoveChapterAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, userId }: { chapterId: string; userId: string }) =>
      chaptersApi.removeChapterAdmin(chapterId, userId),
    onSuccess: (_, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: CHAPTER_KEYS.detail(chapterId) })
    },
  })
}


export function useMemberTrend(){
  return useQuery({
    queryKey: ["member-trend"],
    queryFn: ()=>fetchMemberTrend(),
    // enabled: !!chapterId,
  })
}


async function fetchMemberTrend(){
  try {
    
    const res = await fetch(`${API_BASE_URL}/analytics/member-trend`,{
      method: "Get",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if(!res.ok) throw new Error("Network Issues")

      const data = res.json()

      return data
  } catch (error) {
    console.error(error)
  }
}

async function getViewCount(
  chapterId: string,
  lastMonth = false
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/chapters/${chapterId}/view-count?lastMonth=${lastMonth}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch chapter view count");

    const data = await res.json();

    return data 
  } catch (error) {
    console.error("Get view count error:", error);
    throw error;
  }
}


export const useChapterViewCount = (
  chapterId: string | undefined ,
  lastMonth = false,
) => {

  return useQuery({
    queryKey: ["chapterView", chapterId, lastMonth],
    queryFn: () => getViewCount(chapterId!,lastMonth),
    enabled: !!chapterId,
  });
};