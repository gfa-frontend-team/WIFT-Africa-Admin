import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-lg border border-border shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('p-6 pb-4', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn('text-lg font-semibold text-foreground', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p
      className={cn('text-sm text-muted-foreground mt-1', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('p-6 pt-0', className)}
      {...props}
    />
  )
}
