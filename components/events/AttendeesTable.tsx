'use client'

import { useState } from 'react'
import { Download, Search, Filter, User, Mail, Calendar } from 'lucide-react'
import { EventAttendeesResponse, RSVPStatus } from '@/types'

interface AttendeesTableProps {
  data: EventAttendeesResponse
  onExport?: () => void
  isLoading?: boolean
}

const rsvpStatusColors = {
  [RSVPStatus.GOING]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [RSVPStatus.INTERESTED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [RSVPStatus.NOT_GOING]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function AttendeesTable({ data, onExport, isLoading }: AttendeesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RSVPStatus | ''>('')

  const filteredAttendees = data.attendees.filter(attendee => {
    const matchesSearch = searchTerm === '' || 
      `${attendee.user.firstName} ${attendee.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || attendee.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="w-20 h-6 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Event Attendees</h2>
            <p className="text-sm text-muted-foreground">
              {filteredAttendees.length} of {data.attendees.length} attendees
            </p>
          </div>
          
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.stats.going}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Going</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.stats.interested}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Interested</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.stats.notGoing}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Not Going</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RSVPStatus | '')}
              className="bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
            >
              <option value="">All Status</option>
              <option value={RSVPStatus.GOING}>Going</option>
              <option value={RSVPStatus.INTERESTED}>Interested</option>
              <option value={RSVPStatus.NOT_GOING}>Not Going</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredAttendees.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No attendees found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter 
                ? "No attendees match your current filters."
                : "No one has RSVP'd to this event yet."
              }
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Attendee</th>
                <th className="text-left p-4 font-medium text-foreground">Email</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">RSVP Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {attendee.user.profilePhoto ? (
                        <img
                          src={attendee.user.profilePhoto}
                          alt={`${attendee.user.firstName} ${attendee.user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                          {attendee.user.firstName[0]}{attendee.user.lastName[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-foreground">
                          {attendee.user.firstName} {attendee.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Member ID: {attendee.user.id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <a 
                        href={`mailto:${attendee.user.email}`}
                        className="hover:text-primary transition-colors"
                      >
                        {attendee.user.email}
                      </a>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rsvpStatusColors[attendee.status]}`}>
                      {attendee.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(attendee.rsvpDate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filteredAttendees.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredAttendees.length} of {data.attendees.length} attendees
          </div>
        </div>
      )}
    </div>
  )
}