'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Settings,
  Shield,
  AlertCircle,
  Calendar,
  ShieldAlert,
  BarChart3,
  MessageSquarePlus,
  Radio,
  Banknote,
  Briefcase,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores'
import { useChapter } from '@/lib/hooks/queries/useChapters'
import { getCountryIsoCode } from '@/lib/utils/countryMapping'

const superAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chapters', href: '/dashboard/chapters', icon: Building2 },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Mentorships', href: '/dashboard/mentorships', icon: GraduationCap },
  { name: 'Grants & Funds', href: '/dashboard/funding', icon: Banknote },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Membership Requests', href: '/dashboard/requests', icon: UserCheck },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Verification Delays', href: '/dashboard/verification', icon: AlertCircle },
  { name: 'Reports', href: '/dashboard/reports', icon: ShieldAlert },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Resources', href: '/dashboard/resources', icon: BookOpen },
  { name: 'Moderation', href: '/dashboard/posts', icon: Radio },
  { name: 'Broadcasts', href: '/dashboard/messages', icon: MessageSquarePlus },
  { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const chapterAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Chapter', href: '/dashboard/my-chapter', icon: Building2 },
  { name: 'Broadcasts', href: '/dashboard/messages', icon: MessageSquarePlus },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Mentorships', href: '/dashboard/mentorships', icon: GraduationCap },
  { name: 'Grants & Funds', href: '/dashboard/funding', icon: Banknote },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Membership Requests', href: '/dashboard/requests', icon: UserCheck },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Staff Management', href: '/dashboard/staff', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { admin } = useAuthStore()

  // Fetch chapter details if user is Chapter Admin
  const { data: chapter } = useChapter(admin?.chapterId || '', {
    enabled: !!admin?.chapterId && admin.role === 'CHAPTER_ADMIN',
    isAdminView: true // Use admin endpoint to get full chapter details
  })

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'
  const navigation = isSuperAdmin ? superAdminNavigation : chapterAdminNavigation

  const getRoleBadge = () => {
    if (admin?.role === 'SUPER_ADMIN') {
      return { text: 'Super Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    }
    if (admin?.role === 'CHAPTER_ADMIN') {
      return { text: 'Chapter Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
    }
    return null
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="relative w-30 h-10 rounded-lg overflow-hidden">
          <Image
            src="/logo.jpg"
            alt="WIFT Africa Logo"
            fill
          // className="object-contain"
          />
        </div>

      </div>

      {/* Role Badge */}
      {roleBadge && (
        <div className="px-6 py-3">
          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleBadge.color)}>
            {roleBadge.text}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Special handling for dashboard root to avoid matching all /dashboard/* routes
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent">
          {admin?.role === 'CHAPTER_ADMIN' && chapter ? (
            // Chapter Admin: Show country flag
            (() => {
              const flagCode = getCountryIsoCode(chapter.code, chapter.country)
              
              if (flagCode === 'AFRICA') {
                return (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg">
                    🌍
                  </div>
                )
              }
              
              return (
                <img
                  src={`https://flagsapi.com/${flagCode}/flat/64.png`}
                  alt={`${chapter.country} flag`}
                  className="w-8 h-8 rounded-full object-cover border border-border/50"
                  onError={(e) => {
                    // Fallback to initials if flag fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              )
            })()
          ) : (
            // Super Admin: Show initials
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-medium">
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </div>
          )}
          {/* Fallback initials (hidden by default, shown if flag fails) */}
          {admin?.role === 'CHAPTER_ADMIN' && chapter && (
            <div className="hidden items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-medium">
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {admin?.role === 'CHAPTER_ADMIN' && chapter
                ? chapter.name
                : `${admin?.firstName} ${admin?.lastName}`}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {admin?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
