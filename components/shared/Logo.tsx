'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className = 'h-5 w-auto', alt = 'WIFT Africa' }: LogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use resolvedTheme to handle 'system' theme preference
  const currentTheme = mounted ? resolvedTheme : 'light'
  const logoSrc = currentTheme === 'dark' ? '/WIFTAFRICA DARK MODE.png' : '/WIFTAFRICA.png'

  return (
    <img 
      src={logoSrc} 
      alt={alt} 
      className={className}
    />
  )
}
