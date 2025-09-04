"use client"

import { useParams, useRouter } from "next/navigation";
import { useGetPost } from "@/features/post/use-get-byId";
import { format } from "date-fns";
import { useGetPostComments } from "@/features/post/use-get-post-comments";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { PenIcon, Trash } from "lucide-react";
import { useDeletePost } from "@/features/post/use-delete-post";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import Comment from "./Comment";

const Post = () => {
    const { user, loading } = useAuth();
     const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;
  
    const { data: post, isLoading, error } = useGetPost(postId);
    

    const deletePostMutation = useDeletePost(postId);

    const isAuthor = user && post?.post.user_id === user.id;

    const handleEditClick = () => {
        router.push(`/create-post?edit=true&post-id=${postId}`);
    };

    const handleDeleteClick=async ()=>{
        await deletePostMutation.mutateAsync();
        router.push(`/location/${post?.post.location_id}`)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-4 bg-red-50 rounded-lg mt-6">
                <p className="text-red-600">Failed to load post: {(error as Error).message}</p>
            </div>
        );
    }

    return (
        <>
        <div className="max-w-3xl mx-auto p-4 bg-white rounded-lg  mt-6">
            <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold">{post?.post.heading}</h1>
                <div className="flex justify-center items-center space-x-2">
                {isAuthor && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleEditClick}
                        className="flex items-center gap-1"
                    >
                        <PenIcon size={16} />
                        Edit
                    </Button>
                )}
                {isAuthor && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={()=>{setIsDeleteDialogOpen(true)}}
                        className="flex items-center gap-1"
                    >
                        <Trash size={16} />
                        Delete
                    </Button>
                )}
                </div>
            </div>
      
            <div className="flex items-center text-sm text-gray-600 mb-4">
                <span className="mr-2">By {post?.post.users?.name || "Anonymous"}</span>
                <span className="mx-2">•</span>
                <span>
                    {post?.post.created_at 
                        ? format(new Date(post.post.created_at), 'MMM d, yyyy')
                        : "Unknown date"}
                </span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    {post?.post.upvotes || 0} upvotes
                </span>
            </div>
      
            <div className="prose mb-8">
                {post?.post.body}
            </div>
      
            {/* Comments section */}
            <Comment postId={postId}/>
        </div>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-semibold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will permanently delete your post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClick}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
    );
}

export default Post;