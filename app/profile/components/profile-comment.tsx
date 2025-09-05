"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { useDeleteComment } from "@/features/comments.ts/use-delete-comment";
import { EditComment } from "@/features/comments.ts/use-edit-comment";
import { Trash2, Edit2, Save, X } from "lucide-react";
import { useGetUserComments } from "@/features/user/use-get-user-comment";

export function ProfileCommentsCard() {
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
  } = useGetUserComments();

  const deleteCommentMutation = useDeleteComment();
  const editCommentMutation = EditComment();

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

  const handleEditSubmit = async (commentId: string, locationId: string) => {
    if (!editCommentText.trim()) return;
    
    try {
      await editCommentMutation.mutateAsync({
        comment_id: commentId,
        text: editCommentText,
        location_id: locationId
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
      className="w-full  bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          My Comments ({data?.comments.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {/* Comments List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#000000" }}>Loading comments...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#000000" }}>Failed to load comments</p>
          </div>
        ) : data?.comments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "#000000" }}>No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.comments.map((comment) => (
              <div 
                key={comment.comment_id} 
                className="p-3 rounded-lg bg-[#F8F4EF] border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm" style={{ color: "#000000" }}>
                    <span className="text-indigo-600">On: </span>
                    {comment.locations?.name || "Unknown Location"}
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
                        onClick={() => handleEditSubmit(comment.comment_id, comment.location_id)}
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
                      