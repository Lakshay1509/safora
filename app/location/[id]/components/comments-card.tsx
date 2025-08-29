"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Trash2, Edit2, Save, X } from "lucide-react";

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

  return (
    <Card
      className="w-full  bg-white border border-white/10 min-h-64 transition-colors duration-200 hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          Comments ({data?.locationComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Comment Form */}
        {userId && <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-white/10 border-white/20 text-black placeholder:text-gray-400 resize-none"
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
        </form>}
        
        

        {/* Comments List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#000000" }}>Loading comments...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#000000" }}>Failed to load comments</p>
          </div>
        ) : data?.locationComments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#000000" }}>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.locationComments.map((comment) => (
              <div 
                key={comment.comment_id} 
                className="p-3 rounded-lg bg-[#F8F4EF] border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm" style={{ color: "#000000" }}>
                    {comment.users?.name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs opacity-70" style={{ color: "#000000" }}>
                      {comment.created_at && formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                    {userId && comment.user_id === userId && (
                      <>
                        {editCommentId !== comment.comment_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            onClick={() => handleEditClick(comment.comment_id, comment.text)}
                          >
                            <Edit2 size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {editCommentId === comment.comment_id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-black placeholder:text-gray-400 resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white bg-gray-500"
                        onClick={handleCancelEdit}
                      >
                        <X size={14} className="mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleEditSubmit(comment.comment_id)}
                        disabled={editCommentMutation.isPending || !editCommentText.trim()}
                      >
                        <Save size={14} className="mr-1" /> {editCommentMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                    {editCommentMutation.isError && (
                      <p className="text-xs text-red-400">Failed to edit comment. Please try again.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "#000000" }}>
                    {comment.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
