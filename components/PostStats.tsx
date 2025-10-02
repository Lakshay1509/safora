"use client"




import { ArrowUp, Check, MessageCircle, Share } from "lucide-react"
import { BiUpvote } from "react-icons/bi";
import { Button } from "./ui/button";
import { useGetUpVotesByUser } from "@/features/votes/use-get-upvotes-byUser";
import { addUpvotetoPost } from "@/features/votes/use-post-upvotes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Props {
  id: string,
  upvotes_count?:number,
  comments?:number,
}

const PostStats = ({ id ,upvotes_count,comments}: Props) => {



  
  const { data: upvotes, isLoading: upvotes_loading, isError: upvotes_error } = useGetUpVotesByUser(id);

  const {user,loading} = useAuth();

  const [copied, setCopied] = useState(false);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes_count || 0);

  useEffect(() => {
    setOptimisticUpvotes(upvotes_count || 0);
  }, [upvotes_count]);

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

    const isUpvoted = upvotes?.upvotes && upvotes.upvotes.vote_type !== -1;
    const newVoteType = isUpvoted ? -1 : 1;

    setOptimisticUpvotes(prev => prev + newVoteType);

    mutation.mutate({
      post_id: id,
      vote_type: newVoteType,
    }, {
      onError: () => {
        // Revert optimistic update on error
        setOptimisticUpvotes(prev => prev - newVoteType);
      }
    });

  }


  // if (isLoading) return <div className="mt-6">Loading stats...</div>;
  // if (isError) return <div className="mt-6">Error loading stats</div>;

  return (
    <div className="flex mt-6 gap-3">
  <Button
    className={`${upvotes?.upvotes && upvotes?.upvotes.vote_type !== -1
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
  >
    <MessageCircle className="w-4 h-4" />
    <span className="text-sm font-medium">{comments || 0}</span>
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