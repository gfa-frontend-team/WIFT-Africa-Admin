'use client'

import { useState } from 'react'
import { usePosts } from '@/lib/hooks/queries/usePosts'
import { Post } from '@/types'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter 
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { 
  Loader2, 
  MoreVertical, 
  Pin, 
  EyeOff, 
  Trash2, 
  MessageSquare, 
  Heart,
  Share2,
  Plus
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { PostActionsModal, PostActionType } from '@/components/posts/post-actions-modal'
import { CreatePostModal } from '@/components/posts/create-post-modal'

export default function PostsPage() {
  const [page, setPage] = useState(1)
  
  // Data Fetching
  const { data: postsResponse, isLoading } = usePosts(page, 20)
  const posts = postsResponse?.data || []

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [selectedAction, setSelectedAction] = useState<PostActionType>(null)

  const handleAction = (post: Post, action: PostActionType) => {
    setSelectedPost(post)
    setSelectedAction(action)
    setActionModalOpen(true)
  }

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
    <div className="space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Feed Moderation</h1>
          <p className="text-muted-foreground">Manage posts, announcements, and moderation.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className={post.isHidden ? 'opacity-75 border-red-200 dark:border-red-900/50 bg-red-50/10' : ''}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={post.author?.profilePhoto} />
                    <AvatarFallback>{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">
                      {post.author?.firstName} {post.author?.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      {formatDate(post.createdAt)}
                      {post.isPinned && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                          <Pin className="w-3 h-3 mr-1" /> Pinned
                        </Badge>
                      )}
                      {post.isHidden && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                          <EyeOff className="w-3 h-3 mr-1" /> Hidden
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-foreground shrink-0 ml-2">
                       <span className="sr-only">Actions</span>
                       <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction(post, post.isPinned ? 'UNPIN' : 'PIN')}>
                      <Pin className="mr-2 h-4 w-4" />
                      {post.isPinned ? 'Unpin Post' : 'Pin to Top'}
                    </DropdownMenuItem>
                    {post.isHidden ? (
                      <DropdownMenuItem onClick={() => handleAction(post, 'UNHIDE')}>
                         <EyeOff className="mr-2 h-4 w-4" />
                         Unhide Post
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleAction(post, 'HIDE')}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Post
                      </DropdownMenuItem>
                    )}

                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <Link href={`/dashboard/posts/${post.id}`} className="block transition-opacity hover:opacity-80">
                <CardContent className="space-y-4 cursor-pointer">
                <div className="text-sm whitespace-pre-wrap">
                  {post.content}
                </div>
                
                {/* Media Grid - Simple display for MVP */}
                {post.media && post.media.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {post.media.map((item, idx) => (
                      <div key={idx} className="relative aspect-video bg-muted rounded-md overflow-hidden">
                        {item.type === 'image' ? (
                          <img src={item.url} alt="Post media" className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Video Object
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </CardContent>
              </Link>
              <CardFooter className="border-t bg-muted/5 p-3 flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> {post.stats?.likes || 0}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {post.stats?.comments || 0}
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" /> {post.stats?.shares || 0}
                </div>
              </CardFooter>
            </Card>
          ))}
          {posts.length === 0 && (
             <div className="text-center py-12 text-muted-foreground">
               No posts found in the feed.
             </div>
          )}
        </div>
      )}

      <CreatePostModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {}} // Query invalidation handles refresh
      />

      <PostActionsModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onSuccess={() => {}} // Query invalidation handles refresh
        post={selectedPost}
        action={selectedAction}
      />
    </div>
  )
}
