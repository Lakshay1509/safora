"use client"

import { useGetPostStats } from "@/features/post/use-get-stats";
import { ArrowUp, Check, MessageCircle, Share, Share2 } from "lucide-react"
import { Button } from "./ui/button";
import { addUpvotetoPost } from "@/features/votes/use-post-upvotes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { BiUpvote } from "react-icons/bi";
import { useRouter } from "next/navigation";

interface Props {
  id: string,
  upvotes_count?:number,
  comments?:number,
  upvoted:boolean,
  slug:string
}

const PostStatsFeed = ({ id, upvotes_count, comments, upvoted,slug }: Props) => {
  const { user, loading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes_count || 0);
  // Track upvote state locally to handle optimistic updates
  const [isUpvoted, setIsUpvoted] = useState(upvoted);
  const router = useRouter();

  // Update local state when prop changes
  useEffect(() => {
    setOptimisticUpvotes(upvotes_count || 0);
    setIsUpvoted(upvoted);
  }, [upvotes_count, upvoted]);

  const handleShare = () => {
    navigator.clipboard.writeText(`safeornot.space/post/${id}/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const mutation = addUpvotetoPost();

  const handleClick = () => {
    if(user === null) {
      toast.error("Please login to upvote!");
      return;
    }

    // Use the isUpvoted state to determine vote direction
    const newVoteType = isUpvoted ? -1 : 1;

    // Optimistically update UI
    setIsUpvoted(!isUpvoted);
    setOptimisticUpvotes(prev => prev + newVoteType);

    mutation.mutate({
      post_id: id,
      vote_type: newVoteType,
    }, {
      onError: () => {
        // Revert optimistic updates on error
        setIsUpvoted(isUpvoted);
        setOptimisticUpvotes(prev => prev - newVoteType);
      }
    });
  }

  return (
    <div className="flex mt-6 gap-3">
      <Button
        className={`${isUpvoted
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm transition-all duration-200`}
        onClick={handleClick}
      >
        <BiUpvote className="w-4 h-4" />
        <span className="text-sm font-medium">{optimisticUpvotes}</span>
      </Button>

      <Button
        className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl px-3 py-2 shadow-sm transition-all duration-200"
        onClick={() => router.push(`/post/${id}/${slug}`)}

      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{comments || 0}</span>
      </Button>

      <Button
        className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl px-3 py-2 shadow-sm transition-all duration-200 relative"
        onClick={handleShare}
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
        {copied && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded-md shadow-md">
            Copied!
          </span>
        )}
      </Button>
    </div>
  )
}

export default PostStatsFeed