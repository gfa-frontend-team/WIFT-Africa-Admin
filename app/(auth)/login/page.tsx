'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/lib/stores'
import { useLogin, useGoogleLogin } from '@/lib/hooks/queries/useAuth'
import { Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const { error, isAuthenticated, clearError } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  const { mutate: login, isPending: isLoading, error: loginError } = useLogin()
  const { mutate: googleLogin, isPending: isGoogleLoading } = useGoogleLogin()

  // Use the error from query, or fall back to store error if any (though store shouldn't have much now)
  const errorMessage = loginError?.message || error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email || !password) return

    login(
      { email, password },
      {
        onSuccess: () => {
             router.push('/dashboard')
        },
      }
    )
  }

  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      googleLogin(credentialResponse.credential, {
        onSuccess: () => {
          router.push('/dashboard')
        },
      })
    }
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  return (
    <div className="w-full">
      {/* Logo/Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-4 overflow-hidden relative">
          <Image 
            src="/logo.jpg" 
            alt="WIFT Africa Logo" 
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          WIFT Africa Admin
        </h1>
        <p className="text-muted-foreground">
          Sign in to manage chapters and members
        </p>
      </div>

      {/* Login Form */}
      <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  Login Failed
                </p>
                <p className="text-sm text-destructive/90 mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="admin@wiftafrica.org"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="block w-full pl-10 pr-12 py-3 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <span className="text-xs font-medium">
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary border-input rounded focus:ring-ring focus:ring-2"
              />
              <span className="ml-2 text-sm text-muted-foreground">
                Remember me
              </span>
            </label>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </button>


          {/* Google Login */}
          {googleClientId && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <GoogleOAuthProvider clientId={googleClientId}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      console.error('Google Login Failed')
                    }}
                    useOneTap
                    theme="outline"
                    shape="circle"
                    width="100%"
                  />
                </GoogleOAuthProvider>
              </div>
            </>
          )}
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">
              Admin Access Only
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            This portal is for chapter admins and super admins only.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Need access?{' '}
            <a
              href="mailto:admin@wiftafrica.org"
              className="font-medium text-primary hover:text-primary/80"
            >
              Contact support
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          © 2024 WIFT Africa. All rights reserved.
        </p>
      </div>
    </div>
  )
}
