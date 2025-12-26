'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { useChapterMembers } from '@/lib/hooks/queries/useMembership'
import { Input } from '@/components/ui/Input'
import { Search, Loader2 } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface UserSelectorProps {
  chapterId: string
  onSelect: (user: User) => void
  excludeIds?: string[]
}

export function UserSelector({ chapterId, onSelect, excludeIds = [] }: UserSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  
  // Always fetch members for local filtering since the API might not support search query directly
  // or if we rely on client-side filtering as seen in MembersPage
  const { data: membersResponse, isLoading } = useChapterMembers(
    chapterId,
    1,
    100 // Fetch a reasonable amount for selection
  )

  const members = membersResponse?.data || []
  
  const filteredMembers = members.filter(member => {
    // Exclude already selected/excluded IDs
    if (excludeIds.includes(member.id)) return false
    
    // Only show APPROVED members for admin promotion
    // Note: The API /chapters/:id/members ONLY returns approved members, 
    // and the response object does not include the membershipStatus field.
    // So we don't need to filter explicitly.

    if (!debouncedSearch) return true
    
    const search = debouncedSearch.toLowerCase()
    return (
      member.firstName?.toLowerCase().includes(search) ||
      member.lastName?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search)
    )
  }).slice(0, 5) // Limit to top 5 matches

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member name or email..."
          className="pl-10"
        />
      </div>

      <div className="border border-border rounded-md divide-y divide-border max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground flex justify-center items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? 'No matching members found' : 'No eligible members found'}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              type="button"
              className="w-full text-left p-3 hover:bg-accent transition-colors flex items-center gap-3 group"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-semibold text-xs">
                {member.firstName?.[0]}{member.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <div className="text-xs text-muted-foreground border border-border rounded px-2 py-0.5">
                Select
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
