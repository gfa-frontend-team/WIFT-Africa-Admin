import Link from 'next/link'
import { Users, MapPin, ExternalLink } from 'lucide-react'
import { Chapter } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getCountryIsoCode } from '@/lib/utils/countryMapping'

interface ChapterCardProps {
  chapter: Chapter
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <Link href={`/dashboard/chapters/${chapter.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {(() => {
                const flagCode = getCountryIsoCode(chapter.code, chapter.country)

                if (flagCode === 'AFRICA') {
                  return (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                      🌍
                    </div>
                  )
                }

                return (
                  <img
                    src={`https://flagsapi.com/${flagCode}/flat/64.png`}
                    alt={`${chapter.country} flag`}
                    className="w-12 h-12 rounded-full object-cover border border-border/50"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )
              })()}
              <div>
                <h3 className="font-semibold text-foreground">{chapter.name}</h3>
                <p className="text-sm text-muted-foreground">{chapter.code}</p>
              </div>
            </div>
            <Badge variant={chapter.isActive ? 'success' : 'default'}>
              {chapter.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{chapter.city ? `${chapter.city}, ` : ''}{chapter.country}</span>
          </div>

          {/* Description */}
          {chapter.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {chapter.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{chapter.memberCount}</span>
              <span className="text-muted-foreground">members</span>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
