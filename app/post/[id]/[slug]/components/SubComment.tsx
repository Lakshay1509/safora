"use client"

import { addSubCommenttoPost } from "@/features/post-comment.ts/use-add-subComment";
import { useGetSubComments } from "@/features/post-comment.ts/use-get-subComment"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteCommentPost } from "@/features/post-comment.ts/use-delete-comment";
import { Trash2 } from "lucide-react";

// SubComment schema with validation
const subCommentSchema = z.object({
  text: z.string().min(3, "Reply must be at least 3 characters").max(500, "Reply must be less than 500 characters"),
});

type SubCommentFormValues = z.infer<typeof subCommentSchema>;

interface Props {
  id: string,
  postId: string
}

const SubComment = ({ id, postId }: Props) => {
  const { user, loading } = useAuth();
  const { data, isLoading, isError } = useGetSubComments(id);
  const mutation = addSubCommenttoPost(postId, id);
   const deleteCommentMutation = useDeleteCommentPost();

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<SubCommentFormValues>({
    resolver: zodResolver(subCommentSchema),
    defaultValues: {
      text: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: SubCommentFormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  const handleDelete = async (id: string) => {
        await deleteCommentMutation.mutateAsync({ commentId: id });
    }

    

  return (
    <div className="pl-6 mt-2 border-l-2 border-gray-200">
      {/* Sub-comment form */}
      {user && <div className="mb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write a reply..."
                      className="resize-none text-sm"
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
              size="sm"
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? (
                <>
                  <span className="mr-2">Posting...</span>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : "Post Reply"}
            </Button>
          </form>
        </Form>
      </div>}

      {isLoading && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}

      {isError && (
        <div className="p-2 bg-red-50 rounded-lg">
          <p className="text-red-600 text-sm">Failed to load replies</p>
        </div>
      )}

      {!isLoading && !isError && data?.sub_comment.length === 0 && (
        <p className="text-gray-500 italic text-sm">No replies yet.</p>
      )}

      <div className="space-y-3">
        {data?.sub_comment.map((reply) => (
          <div key={reply.id} className="p-2 bg-gray-50 rounded-lg text-sm">
            <div className="flex items-center text-xs text-gray-600 mb-1">
              <span className="font-medium">{reply.users?.name}</span>
              <span className="mx-2">•</span>
              <span>
                {reply.created_at
                  ? format(new Date(reply.created_at), 'MMM d, yyyy')
                  : "Unknown date"}
              </span>
              {user && reply.user_id === user.id && (
                                <div className="flex gap-2 ml-auto pl-2">
                                    <button
                                        onClick={() => handleDelete(reply.id)}
                                        disabled={deleteCommentMutation.isPending}
                                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
            </div>
            <p className="text-gray-800">{reply.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SubComment