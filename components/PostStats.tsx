"use client"



import { useGetPostStats } from "@/features/post/use-get-stats";
import { ArrowUp, MessageCircle, Share } from "lucide-react"
import { Button } from "./ui/button";
import { useGetUpVotesByUser } from "@/features/votes/use-get-upvotes-byUser";
import { addUpvotetoPost } from "@/features/votes/use-post-upvotes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  id: string
}

const PostStats = ({ id }: Props) => {



  const { data, isLoading, isError } = useGetPostStats(id);
  const { data: upvotes, isLoading: upvotes_loading, isError: upvotes_error } = useGetUpVotesByUser(id);

  const {user,loading} = useAuth();



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
    <div className="flex mt-6 gap-2">
      <Button
        className={`${upvotes?.upvotes && upvotes?.upvotes.vote_type !== -1
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-100 text-black hover:bg-gray-200"
          } border-black px-1 py-1 text-sm`}
        onClick={handleClick}
      >

        <ArrowUp className="w-4 h-4" />

        <span className="text-sm">{data?.upvotes.upvotes || 0}</span>
      </Button>

      <Button className="bg-gray-100 text-black hover:bg-gray-200 border-black  px-2 py-1">

        <MessageCircle className="w-4 h-4" />

        <span className="text-sm">{data?.comment_count || 0}</span>
      </Button>

      <Button className="bg-gray-100 text-black hover:bg-gray-200 border-black  px-2 py-1">

        <Share className="w-4 h-4" />


      </Button>
    </div>
  )
}

export default PostStats