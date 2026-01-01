'use client'

import { useEventAttendees } from '@/lib/hooks/queries/useEvents'
import { Check, HelpCircle, XCircle } from 'lucide-react'
import { RSVPStatus } from '@/types'

export function AttendeesList({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useEventAttendees(eventId)

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Loading attendees...</div>
  if (error) return <div className="py-8 text-center text-destructive text-sm">Failed to load attendees</div>
  if (!data?.attendees.length) return <div className="py-8 text-center text-muted-foreground text-sm">No attendees yet.</div>

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard 
          label="Going" 
          count={data.stats.going} 
          icon={<Check className="w-4 h-4 text-green-600" />} 
          bg="bg-green-50 dark:bg-green-900/10" 
        />
        <StatsCard 
          label="Interested" 
          count={data.stats.interested} 
          icon={<HelpCircle className="w-4 h-4 text-blue-600" />} 
          bg="bg-blue-50 dark:bg-blue-900/10" 
        />
        <StatsCard 
          label="Not Going" 
          count={data.stats.notGoing} 
          icon={<XCircle className="w-4 h-4 text-red-600" />} 
          bg="bg-red-50 dark:bg-red-900/10" 
        />
      </div>

      {/* List */}
      <div className="overflow-hidden border border-border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">RSVP Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.attendees.map((attendee) => (
              <tr key={attendee.user.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{attendee.user.firstName} {attendee.user.lastName}</div>
                  <div className="text-xs text-muted-foreground">{attendee.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium 
                    ${attendee.status === RSVPStatus.GOING ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      attendee.status === RSVPStatus.INTERESTED ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {attendee.status === RSVPStatus.GOING && <Check className="w-3 h-3" />}
                    {attendee.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(attendee.rsvpDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatsCard({ label, count, icon, bg }: { label: string, count: number, icon: React.ReactNode, bg: string }) {
  return (
    <div className={`p-3 rounded-lg border border-transparent ${bg} flex flex-col items-center justify-center text-center`}>
      <div className="flex items-center gap-1.5 mb-1 text-sm font-medium">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{count}</div>
    </div>
  )
}
