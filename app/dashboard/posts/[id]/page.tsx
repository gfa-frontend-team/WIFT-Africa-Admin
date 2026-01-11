'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { postsApi } from '@/lib/api/posts'
import { Post } from '@/types'
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardFooter 
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loader2, ArrowLeft, Pin, EyeOff, MoreVertical, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/Separator'
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/DropdownMenu'
import { PostActionsModal, PostActionType } from '@/components/posts/post-actions-modal'

export default function PostDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  // Actions state
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<PostActionType>(null)

  const fetchPost = async () => {
    try {
      setLoading(true)
      // We don't have getPost(id) in api yet, adding it to lib/api/posts.ts is needed
      // For now, I'll assume getFeed can't get single. 
      // I will add getPost to api next.
      // Wait, checking lib/api/posts.ts...
      // I only implemented getFeed, createAdminPost, pin, hide, unhide, delete.
      // I need to implement getPost.
      const response = await postsApi.getPost(params.id as string)
      setPost(response)
    } catch (err) {
      console.error('Failed to load post', err)
      // Redirect or show error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
       fetchPost()
    }
  }, [params.id])

  const handleAction = (action: PostActionType) => {
    setSelectedAction(action)
    setActionModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Post not found</h2>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author?.profilePhoto} />
                  <AvatarFallback>{post.author?.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {post.author?.firstName} {post.author?.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                       <span className="sr-only">Actions</span>
                       <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction(post.isPinned ? 'UNPIN' : 'PIN')}>
                      <Pin className="mr-2 h-4 w-4" />
                      {post.isPinned ? 'Unpin Post' : 'Pin to Top'}
                    </DropdownMenuItem>
                    {post.isHidden ? (
                      <DropdownMenuItem onClick={() => handleAction('UNHIDE')}>
                         <EyeOff className="mr-2 h-4 w-4" />
                         Unhide Post
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleAction('HIDE')}>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Post
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600"
                      onClick={() => handleAction('DELETE')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
               {post.isPinned && (
                  <Badge variant="secondary" className="mb-2">
                    <Pin className="w-3 h-3 mr-1" /> Pinned
                  </Badge>
                )}
                {post.isHidden && (
                  <Badge variant="destructive" className="mb-2 ml-2">
                    <EyeOff className="w-3 h-3 mr-1" /> Hidden
                  </Badge>
                )}
              
              <div className="whitespace-pre-wrap text-base">
                {post.content}
              </div>

              {post.media && post.media.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                   {post.media.map((item, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border">
                         {item.type === 'image' ? (
                           <img src={item.url} alt="Post media" className="w-full h-auto" />
                         ) : (
                           <div className="p-12 text-center bg-muted">Video Player Placeholder</div>
                         )}
                      </div>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Comments</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Comments moderation coming soon.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card>
             <CardHeader>
               <h3 className="font-semibold">Analytics Overview</h3>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Likes</span>
                 <span className="font-medium">{post.stats?.likes || 0}</span>
               </div>
               <Separator />
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Comments</span>
                 <span className="font-medium">{post.stats?.comments || 0}</span>
               </div>
               <Separator />
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Shares</span>
                 <span className="font-medium">{post.stats?.shares || 0}</span>
               </div>
               <Separator />
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Saves</span>
                 <span className="font-medium">{post.stats?.saves || 0}</span>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>

      <PostActionsModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onSuccess={fetchPost}
        post={post}
        action={selectedAction}
      />
    </div>
  )
}
