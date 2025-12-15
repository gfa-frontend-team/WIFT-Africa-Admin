'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth, refreshUser } = useAuthStore()

  useEffect(() => {
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, checkAuth])

  // Safety check: Refresh user data if accountType is missing
  // This handles cases where users logged in before the auth fix
  useEffect(() => {
    if (isAuthenticated && user && !user.accountType) {
      console.warn('⚠️ User missing accountType, refreshing user data...')
      refreshUser()
    }
  }, [isAuthenticated, user, refreshUser])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="pt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
