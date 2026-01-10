'use client'

import { useEffect, useState } from 'react'
import { messagesApi } from '@/lib/api/messages'
import { BroadcastConversation } from '@/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Loader2, Send } from 'lucide-react'
import { BroadcastModal } from '@/components/messages/broadcast-modal'


export default function MessagesPage() {
  const [messages, setMessages] = useState<BroadcastConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await messagesApi.getBroadcasts(1, 20)
      setMessages(response.data || [])
    } catch (err) {
      console.error('Failed to load messages', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broadcast Messages</h1>
          <p className="text-muted-foreground">Manage system-wide announcements and notifications.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Broadcast
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Recent broadcasts sent to members.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-8">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground w-48">
                      {formatDate(msg.lastMessage?.createdAt || new Date().toISOString())}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">
                        {/* We use content as subject if title isn't available in list */}
                         {msg.lastMessage?.content}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {messages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center h-32 text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Send className="w-8 h-8 text-muted-foreground/50" />
                        <p>No broadcasts sent yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <BroadcastModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMessages}
      />
    </div>
  )
}
