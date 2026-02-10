'use client'

import { useChapters } from '@/lib/hooks/queries/useChapters'
import { useAuthStore } from '@/lib/stores/authStore'
import { AccountType } from '@/types'

interface ChapterSelectProps {
    value?: string
    onChange: (value: string) => void
    error?: string
    required?: boolean
    disabled?: boolean
}

export function ChapterSelect({
    value,
    onChange,
    error,
    required = false,
    disabled = false
}: ChapterSelectProps) {
    const { user } = useAuthStore()
    const { data: chaptersData, isLoading } = useChapters({ isActive: true })

    const isSuperAdmin = user?.accountType === AccountType.SUPER_ADMIN
    const isChapterAdmin = user?.accountType === AccountType.CHAPTER_ADMIN

    const chapters = chaptersData?.data || []

    // Chapter Admin: auto-assign their chapter, don't show field
    if (isChapterAdmin && user?.chapterId) {
        return <input type="hidden" value={user.chapterId} onChange={() => { }} />
    }

    // Super Admin: show dropdown
    if (isSuperAdmin) {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Chapter {required && <span className="text-destructive">*</span>}
                </label>
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || isLoading}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Global (All Chapters)</option>
                    {chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                            {chapter.name} ({chapter.code})
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        )
    }

    // For other roles, don't show the field
    return null
}
