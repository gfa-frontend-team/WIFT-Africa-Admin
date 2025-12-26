'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, Suspense, lazy } from 'react'

const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((d) => ({
    default: d.ReactQueryDevtools,
  }))
)

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false, // Optional: prevent refetch on window focus if desired
          },
        },
      })
  )

  const [showDevtools, setShowDevtools] = useState(false)

  useEffect(() => {
    // Only load devtools on client side
    setShowDevtools(true)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}
