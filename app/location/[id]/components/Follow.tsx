"use client"

import { Button } from "@/components/ui/button";
import { useGetFollow } from "@/features/following/use-get-follow"
import { useDeleteFollow } from "@/features/following/use-delete-follow";
import { addFollow } from "@/features/following/use-post-follow";
import { PlusCircle, PlusCircleIcon, PlusIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props{
    id:string
}

const Follow = ({id}:Props) => {
    const {data, isLoading, isError} = useGetFollow(id);
    const deleteFollowMutation = useDeleteFollow();
    const addFollowMutation = addFollow();
    const {user,loading} = useAuth();
    
    const handleFollowToggle = () => {
        if(user===null){
          toast.error("Please login to follow");
          return;
        }
        if (data?.data!==null) {
            deleteFollowMutation.mutate({id: id});
        } else {
            
            addFollowMutation.mutate({location_id: id});
        }
    };



  return (
    <div className="mb-6 w-full flex justify-start lg:justify-end px-8 ">
    <Button
      variant="default"
      onClick={handleFollowToggle}
      disabled={isLoading || deleteFollowMutation.isPending || addFollowMutation.isPending}
      className={` px-2 py-2.5 rounded-xl  shadow-md transition-all duration-300 flex items-center gap-2 text-sm 
        ${data?.data?.id 
          ? "bg-gradient-to-r from-red-500 to-red-600 text-white  hover:shadow-lg" 
          : "bg-gradient-to-r from-white to-gray-50 text-gray-800 border border-gray-300 hover:bg-gray-100 hover:shadow-md"
        }`}
    >
      <PlusIcon size={16} />
      {isLoading || deleteFollowMutation.isPending || addFollowMutation.isPending
        ? "Loading..."
        : data?.data?.id ? "Unfollow" : "Follow"}
    </Button>
    </div>
  )
}

export default Follow