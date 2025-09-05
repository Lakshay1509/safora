"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useGetLocationComments } from "@/features/location/use-get-location-comments";
import { useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/features/comments.ts/use-post-comment";
import { createClient } from "@/utils/supabase/client";
import { useDeleteComment } from "@/features/comments.ts/use-delete-comment";
import { EditComment } from "@/features/comments.ts/use-edit-comment";
import { Trash2, PenSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CommentsCard() {
  const params = useParams();
  const id = params.id as string;
  const [commentText, setCommentText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  
  const supabase = createClient();
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getCurrentUser();
  }, []);
  
  const {
      data,
      isLoading,
      isError
  } = useGetLocationComments(id);

  const commentMutation = addComment();
  const deleteCommentMutation = useDeleteComment();
  const editCommentMutation = EditComment();

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

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({
        comment_id: commentId
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleEditClick = (commentId: string, text: string) => {
    setEditCommentId(commentId);
    setEditCommentText(text);
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    
    try {
      await editCommentMutation.mutateAsync({
        comment_id: commentId,
        text: editCommentText,
        location_id:id
      });
      setEditCommentId(null);
      setEditCommentText("");
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentText("");
  };

  if(isLoading){
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      {userId && (
        <div className="mb-6">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full border border-gray-200 rounded-md mb-2 resize-none bg-white text-gray-800 p-3"
            rows={2}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleCommentSubmit}
              disabled={commentMutation.isPending || !commentText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Loading comments...</p>
        </div>
      ) : isError ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Failed to load comments</p>
        </div>
      ) : data?.locationComments.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No comments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.locationComments.map((comment) => (
            <div 
              key={comment.comment_id} 
              className="p-3 border-b border-gray-100 text-sm last:border-none"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-black">
                  {comment.users?.name || "Anonymous"}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] text-gray-500">
                    {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                  {userId && comment.user_id === userId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(comment.comment_id, comment.text)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <PenSquare size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        disabled={deleteCommentMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {editCommentId === comment.comment_id ? (
                <div className="space-y-2 mt-2">
                  <Textarea
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    className="w-full border border-gray-200 rounded-md resize-none bg-white text-gray-800"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-gray-700 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditSubmit(comment.comment_id)}
                      disabled={editCommentMutation.isPending || !editCommentText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editCommentMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800">
                  {comment.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
                      
