'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { Logo } from '@/components/shared/Logo'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required'
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    const emailValidationError = validateEmail(email)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    setIsLoading(true)
    setError(null)
    setEmailError(null)

    try {
      // ✅ Call admin forgot password endpoint
      await authApi.adminForgotPassword(email)
      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Forgot password error:', err)
      const message = err.response?.data?.message || 'Failed to send reset email. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Clear errors when user starts typing
    if (emailError) setEmailError(null)
    if (error) setError(null)
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-block mb-6">
              <Logo className="h-5 w-auto mx-auto" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
          </div>

          {/* Success Card */}
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
            <p className="text-muted-foreground mb-8">
              If an admin account with <strong>{email}</strong> exists, we've sent you a password reset link.
            </p>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors"
              >
                Back to Admin Login
              </Link>

              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
                className="w-full py-3 px-4 border border-border bg-background hover:bg-accent rounded-lg font-medium transition-colors"
              >
                Send Another Email
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/contact" className="text-primary hover:text-primary/80">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">

        <div className='flex justify-between items-end'>

        {/* Logo */}
        <Link href="/" className="inline-flex items-center space-x-2 mb-8">
          <Logo className="h-10 w-auto" />
        </Link>

        {/* Back to Admin Login */}
        <Link
          href="/login"
          className=" items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Back to admin login
        </Link>

          </div>
        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Forgot your password?</h1>
            <p className="text-muted-foreground">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-3 text-red-600 hover:text-red-800"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring ${emailError ? 'border-destructive' : 'border-border'
                    }`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-destructive">{emailError}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3 px-4 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/admin/login" className="text-primary hover:text-primary/80 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}