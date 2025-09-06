"use client"



import { useGetPostStats } from "@/features/post/use-get-stats";
import { ArrowUp, Check, MessageCircle, Share } from "lucide-react"
import { Button } from "./ui/button";
import { useGetUpVotesByUser } from "@/features/votes/use-get-upvotes-byUser";
import { addUpvotetoPost } from "@/features/votes/use-post-upvotes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  id: string
}

const PostStats = ({ id }: Props) => {



  const { data, isLoading, isError } = useGetPostStats(id);
  const { data: upvotes, isLoading: upvotes_loading, isError: upvotes_error } = useGetUpVotesByUser(id);

  const {user,loading} = useAuth();

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`safeornot.space/post/${id}`); // copy current URL
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // reset after 1.5s
  };



  const mutation = addUpvotetoPost();

  const handleClick = () => {

    if(user===null){
      toast.error("Please login to upvote!")
      return;
    }

    if (upvotes?.upvotes === null || upvotes?.upvotes.vote_type ===-1) {
      mutation.mutateAsync({
        post_id: id,
        vote_type: 1,
      })
    }
    else {
      mutation.mutateAsync({
        post_id: id,
        vote_type: -1,
      })

    }

  }


  if (isLoading) return <div className="mt-6">Loading stats...</div>;
  if (isError) return <div className="mt-6">Error loading stats</div>;

  return (
    <div className="flex mt-6 gap-3">
  <Button
    className={`${upvotes?.upvotes && upvotes?.upvotes.vote_type !== -1
        ? "bg-green-500 text-white hover:bg-green-600"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm transition-all duration-200`}
    onClick={handleClick}
  >
    <ArrowUp className="w-4 h-4" />
    <span className="text-sm font-medium">{data?.upvotes.upvotes || 0}</span>
  </Button>

  <Button
    className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl px-3 py-2 shadow-sm transition-all duration-200"
  >
    <MessageCircle className="w-4 h-4" />
    <span className="text-sm font-medium">{data?.comment_count || 0}</span>
  </Button>

  <Button
        className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl px-3 py-2 shadow-sm transition-all duration-200 relative"
        onClick={handleShare}
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share className="w-4 h-4" />}
        {copied && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded-md shadow-md">
            Copied!
          </span>
        )}
      </Button>
</div>

  )
}

export default PostStats