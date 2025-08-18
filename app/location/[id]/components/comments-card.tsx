"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationComments } from "@/features/location/use-get-location-comments";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/features/location/use-post-comment";

export function CommentsCard() {
  const params = useParams();
  const id = params.id as string;
  const [commentText, setCommentText] = useState("");
  
  const {
      data,
      isLoading,
      isError
  } = useGetLocationComments(id);

  const commentMutation = addComment();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      await commentMutation.mutateAsync({
        id: id,
        text: commentText
      });
      setCommentText(""); 
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  return (
    <Card
      className="w-full text-white bg-white/5 backdrop-blur-md border border-white/10 min-h-64 transition-colors duration-200 hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#EAEAEA" }}>
          Comments ({data?.locationComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={commentMutation.isPending || !commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {commentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </form>
        
        {/* Comment submission feedback */}
        {commentMutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-200">
            Failed to post comment. Please try again.
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#9CA3AF" }}>Loading comments...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#9CA3AF" }}>Failed to load comments</p>
          </div>
        ) : data?.locationComments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#9CA3AF" }}>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.locationComments.map((comment) => (
              <div 
                key={comment.comment_id} 
                className="p-3 rounded-lg bg-white/10 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm" style={{ color: "#EAEAEA" }}>
                    {comment.users?.name || "Anonymous"}
                  </p>
                  <p className="text-xs opacity-70" style={{ color: "#9CA3AF" }}>
                    {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#D1D5DB" }}>
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
