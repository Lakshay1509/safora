"use client"



import { useGetPostStats } from "@/features/post/use-get-stats";
import { ArrowUp, MessageCircle, Share } from "lucide-react"
import { Button } from "./ui/button";

interface Props{
    id:string
}

const PostStats = ({id}:Props) => {

    const {data,isLoading,isError} = useGetPostStats(id);
  
    if (isLoading) return <div className="mt-6">Loading stats...</div>;
    if (isError) return <div className="mt-6">Error loading stats</div>;
  
    return (
      <div className="flex mt-6 gap-2">
                <Button className="bg-gray-100 text-black hover:bg-gray-200 border-black px-2 py-1 text-sm">
                  
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