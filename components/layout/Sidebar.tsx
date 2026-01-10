'use client'

import Link from 'next/link'
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
  MessageSquarePlus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores'

const superAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chapters', href: '/dashboard/chapters', icon: Building2 },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Membership Requests', href: '/dashboard/requests', icon: UserCheck },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Verification Delays', href: '/dashboard/verification', icon: AlertCircle },
  { name: 'Reports', href: '/dashboard/reports', icon: ShieldAlert },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Broadcasts', href: '/dashboard/messages', icon: MessageSquarePlus },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const chapterAdminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Chapter', href: '/dashboard/my-chapter', icon: Building2 },
  { name: 'Broadcasts', href: '/dashboard/messages', icon: MessageSquarePlus },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Chapter', href: '/dashboard/my-chapter', icon: Building2 },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Membership Requests', href: '/dashboard/requests', icon: UserCheck },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const isSuperAdmin = user?.accountType === 'SUPER_ADMIN'
  const navigation = isSuperAdmin ? superAdminNavigation : chapterAdminNavigation

  const getRoleBadge = () => {
    if (user?.accountType === 'SUPER_ADMIN') {
      return { text: 'Super Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    }
    if (user?.accountType === 'CHAPTER_ADMIN') {
      return { text: 'Chapter Admin', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
    }
    return null
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">WIFT Africa</h1>
          <p className="text-xs text-muted-foreground">Admin Portal</p>
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
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-medium">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
