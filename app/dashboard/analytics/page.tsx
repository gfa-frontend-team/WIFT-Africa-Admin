'use client'

import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api/analytics'
import { PostAnalyticsDetail } from '@/types'
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
import { Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<PostAnalyticsDetail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await analyticsApi.getPostAnalyticsList(1, 20)
        // Adjust based on actual API response structure if needed
        setPosts(response.data || []) 
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground">Detailed performance metrics for platform content.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
          <CardDescription>Engagement metrics for recent posts.</CardDescription>
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
                  <TableHead>Post ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reach</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Shares</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.postId}>
                    <TableCell className="font-medium truncate max-w-[150px]" title={post.postId}>
                      {post.postId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.postType}</Badge>
                    </TableCell>
                    <TableCell>{post.discovery.membersReached}</TableCell>
                    <TableCell>{post.engagement.likes}</TableCell>
                    <TableCell>{post.engagement.comments}</TableCell>
                    <TableCell>{post.engagement.shares}</TableCell>
                  </TableRow>
                ))}
                {posts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      No posts data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
