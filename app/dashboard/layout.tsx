'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

import { useUser } from '@/lib/hooks/queries/useAuth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)
  
  // Keep user data fresh and sync with store
  useUser()

  useEffect(() => {
    setIsMounted(true)
    checkAuth()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, checkAuth])


  if (!isMounted || !isAuthenticated) {
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
