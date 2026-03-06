'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'

export default function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      errors.newPassword = 'Password must contain uppercase, lowercase, and number'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (currentPassword === newPassword) {
      errors.newPassword = 'New password must be different from current password'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'currentPassword':
        setCurrentPassword(value)
        break
      case 'newPassword':
        setNewPassword(value)
        break
      case 'confirmPassword':
        setConfirmPassword(value)
        break
    }

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // ✅ Call admin change password endpoint
      await authApi.adminChangePassword(currentPassword, newPassword)

      setIsSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFormErrors({})

      toast.success('Password changed successfully')

      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err: any) {
      console.error('Change password error:', err)
      const message = err.response?.data?.message || 'Failed to change password. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Password changed successfully
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your password has been updated. Use your new password for future logins.
            </p>
          </div>
        </div>
      )}

      {/* Change Password Card */}
      <div className="p-6 border border-border rounded-lg bg-card shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-1">Change Your Password</h3>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password Field */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                  formErrors.currentPassword ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Enter your current password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {formErrors.currentPassword && (
              <p className="mt-1 text-sm text-destructive">{formErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                  formErrors.newPassword ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Enter your new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {formErrors.newPassword && (
              <p className="mt-1 text-sm text-destructive">{formErrors.newPassword}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                  formErrors.confirmPassword ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="mt-1 text-sm text-destructive">{formErrors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Password requirements:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                At least 8 characters
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                At least one uppercase letter
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                At least one lowercase letter
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${/\d/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                At least one number
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setFormErrors({})
              }}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-medium">🔒 Security Tip:</span> Use a unique password that you don't use anywhere else.
          </p>
        </div>
      </div>
    </div>
  )
}