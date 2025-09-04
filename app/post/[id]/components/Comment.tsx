"use client"

import { addCommenttoPost } from "@/features/post-comment.ts/use-add-comment-post";
import { useGetPostComments } from "@/features/post/use-get-post-comments";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, MessageCircle } from "lucide-react";
import SubComment from "./SubComment";
import { useState } from "react";


// Comment schema with validation
const commentSchema = z.object({
  text: z.string().min(3, "Comment must be at least 3 characters").max(500, "Comment must be less than 500 characters"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface Props{
    postId:string
}

const Comment = ({postId}:Props) => {
    const {data: comments, isLoading: commentsLoading, error: commentsError} = useGetPostComments(postId);
    const mutation = addCommenttoPost(postId);
    const [openReplies, setOpenReplies] = useState<string[]>([]);

    // Toggle reply section visibility
    const toggleReplySection = (commentId: string) => {
        setOpenReplies(prev => 
            prev.includes(commentId) 
                ? prev.filter(id => id !== commentId) 
                : [...prev, commentId]
        );
    };

    // Initialize form with React Hook Form and Zod validation
    const form = useForm<CommentFormValues>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            text: "",
        },
    });

    // Handle form submission
    const onSubmit = (values: CommentFormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    return (
        <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            
            {/* Comment form */}
            <div className="mb-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Write a comment..." 
                                            className="resize-none" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            disabled={mutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            {mutation.isPending ? (
                                <>
                                    <span className="mr-2">Posting...</span>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                </>
                            ) : "Post Comment"}
                        </Button>
                    </form>
                </Form>
            </div>
            
            {commentsLoading && (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            )}
    
            {commentsError && (
                <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-red-600">Failed to load comments: {(commentsError as Error).message}</p>
                </div>
            )}
    
            {!commentsLoading && !commentsError && comments?.post_comments.length === 0 && (
                <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
            )}
    
            <div className="space-y-4">
                {comments?.post_comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="font-medium">{comment.users?.name || "Anonymous"}</span>
                            <span className="mx-2">•</span>
                            <span>
                                {comment.created_at 
                                    ? format(new Date(comment.created_at), 'MMM d, yyyy')
                                    : "Unknown date"}
                            </span>
                        </div>
                        <p className="text-gray-800">{comment.text}</p>
                        <div className="mt-2 flex items-center justify-between">
                            <button 
                                onClick={() => toggleReplySection(comment.id)}
                                className="text-sm text-blue-500 flex items-center hover:underline"
                            >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {openReplies.includes(comment.id) ? "Hide replies" : "Reply"}
                            </button>
                        </div>
                        
                        {/* Show sub-comments and reply form when expanded */}
                        {openReplies.includes(comment.id) && (
                            <SubComment id={comment.id} postId={postId} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Comment