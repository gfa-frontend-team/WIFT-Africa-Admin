'use client'

import { useState } from 'react'
import { Check, Clock, X, User } from 'lucide-react'
import { useRSVPToEvent, useCancelRSVP } from '@/lib/hooks/queries/useEvents'
import { useAuthStore } from '@/lib/stores'
import { RSVPStatus } from '@/types'

interface RSVPButtonProps {
  eventId: string
  currentRSVP?: RSVPStatus | null
  isEventFull?: boolean
  isEventCancelled?: boolean
  isEventPast?: boolean
}

const rsvpOptions = [
  {
    status: RSVPStatus.GOING,
    label: 'Going',
    icon: Check,
    color: 'bg-green-600 hover:bg-green-700 text-white',
    selectedColor: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  },
  {
    status: RSVPStatus.INTERESTED,
    label: 'Interested',
    icon: Clock,
    color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    selectedColor: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  },
  {
    status: RSVPStatus.NOT_GOING,
    label: 'Not Going',
    icon: X,
    color: 'bg-red-600 hover:bg-red-700 text-white',
    selectedColor: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
  },
]

export function RSVPButton({ 
  eventId, 
  currentRSVP, 
  isEventFull = false, 
  isEventCancelled = false,
  isEventPast = false 
}: RSVPButtonProps) {
  const { isAuthenticated } = useAuthStore()
  const [showOptions, setShowOptions] = useState(false)
  
  const rsvpMutation = useRSVPToEvent()
  const cancelRSVPMutation = useCancelRSVP()

  const isLoading = rsvpMutation.isPending || cancelRSVPMutation.isPending

  const handleRSVP = async (status: RSVPStatus) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/login'
      return
    }

    try {
      if (currentRSVP === status) {
        // Cancel RSVP if clicking the same status
        await cancelRSVPMutation.mutateAsync(eventId)
      } else {
        // Update RSVP to new status
        await rsvpMutation.mutateAsync({
          eventId,
          data: { status }
        })
      }
      setShowOptions(false)
    } catch (error) {
      console.error('RSVP failed:', error)
    }
  }

  // Don't show RSVP for past or cancelled events
  if (isEventPast || isEventCancelled) {
    return null
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => window.location.href = '/login'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <User className="w-4 h-4" />
          Login to RSVP
        </button>
      </div>
    )
  }

  // Show warning if event is full and user is not already going
  if (isEventFull && currentRSVP !== RSVPStatus.GOING) {
    return (
      <div className="flex flex-col gap-2">
        <div className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-center">
          Event is Full
        </div>
        {currentRSVP && (
          <div className="text-sm text-muted-foreground text-center">
            Your RSVP: {currentRSVP.replace('_', ' ')}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Main RSVP Button */}
      {!currentRSVP ? (
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'RSVP'}
        </button>
      ) : (
        <div className="space-y-2">
          {/* Current RSVP Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your RSVP:</span>
            <button
              onClick={() => setShowOptions(!showOptions)}
              disabled={isLoading}
              className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${
                rsvpOptions.find(opt => opt.status === currentRSVP)?.selectedColor
              }`}
            >
              {currentRSVP.replace('_', ' ')}
            </button>
          </div>
          
          {/* Change RSVP Button */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Change RSVP'}
          </button>
        </div>
      )}

      {/* RSVP Options Dropdown */}
      {showOptions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)}
          />
          
          {/* Options Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
            {rsvpOptions.map((option) => {
              const Icon = option.icon
              const isSelected = currentRSVP === option.status
              
              return (
                <button
                  key={option.status}
                  onClick={() => handleRSVP(option.status)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors ${
                    isSelected ? 'bg-accent' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <span className="text-xs text-muted-foreground">Current</span>
                  )}
                </button>
              )
            })}
            
            {/* Cancel RSVP Option */}
            {currentRSVP && (
              <>
                <div className="border-t border-border" />
                <button
                  onClick={() => handleRSVP(currentRSVP)} // This will cancel since it's the same status
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel RSVP</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}