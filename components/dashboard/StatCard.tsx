import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
  href?: string
  onClick?: () => void
}

export function StatCard({ title, value, icon: Icon, trend, className, href, onClick }: StatCardProps) {
  const content = (
    <Card 
      className={cn(
        'transition-shadow h-full flex flex-col justify-center', 
        (href || onClick) ? 'hover:shadow-md cursor-pointer hover:border-primary/50' : '',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">
                {value}
              </p>
              {trend && (
                <p className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg shrink-0 ml-4">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>
  }

  return content
}
