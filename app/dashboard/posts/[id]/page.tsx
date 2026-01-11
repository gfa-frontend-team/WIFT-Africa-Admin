'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePost, usePostComments, useDeleteComment } from '@/lib/hooks/queries/usePosts'
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

// Helper component for comment item to use hook
function CommentItem({ comment }: { comment: any }) {
  const { mutateAsync: deleteComment, isPending } = useDeleteComment()
  
  const handleDelete = async () => {
    if (confirm('Delete this comment?')) {
      await deleteComment({ commentId: comment.id })
    }
  }

  return (
    <div className="flex gap-4">
       <Avatar className="h-8 w-8">
         <AvatarImage src={comment.author?.profilePhoto} />
         <AvatarFallback>{comment.author?.firstName?.[0]}</AvatarFallback>
       </Avatar>
       <div className="flex-1 space-y-1">
         <div className="flex items-center justify-between">
           <div className="text-sm font-semibold">
             {comment.author?.firstName} {comment.author?.lastName}
             <span className="text-muted-foreground font-normal ml-2">
               {new Date(comment.createdAt).toLocaleDateString()}
             </span>
           </div>
           <Button 
             variant="ghost" 
             size="sm" 
             className="h-8 w-8 text-muted-foreground hover:text-red-500"
             onClick={handleDelete}
             disabled={isPending}
           >
             {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
           </Button>
         </div>
         <p className="text-sm text-gray-700 dark:text-gray-300">
           {comment.content}
         </p>
       </div>
    </div>
  )
}

export default function PostDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  // Queries
  const { data: post, isLoading: isPostLoading } = usePost(postId)
  const { data: comments, isLoading: isCommentsLoading } = usePostComments(postId)
  
  // Loading state
  const loading = isPostLoading || isCommentsLoading

  // Actions state
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<PostActionType>(null)

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
              <h3 className="text-lg font-semibold">Comments ({comments?.length || 0})</h3>
            </CardHeader>
            <CardContent>
               {isCommentsLoading ? (
                 <div className="flex justify-center p-8">
                   <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                 </div>
               ) : comments && comments.length > 0 ? (
                 <div className="space-y-6">
                   {comments.map((comment: any) => (
                      <CommentItem key={comment.id} comment={comment} />
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
                   No comments yet.
                 </div>
               )}
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
        onSuccess={() => {}} 
        post={post}
        action={selectedAction}
      />
    </div>
  )
}
