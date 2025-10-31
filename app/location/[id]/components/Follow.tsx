"use client"

import { Button } from "@/components/ui/button";
import { useDeleteFollow } from "@/features/following/use-delete-follow";
import { addFollow } from "@/features/following/use-post-follow";
import { PlusIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  id: string;
  following: boolean;
}

const Follow = ({ id, following }: Props) => {
  const deleteFollowMutation = useDeleteFollow();
  const addFollowMutation = addFollow();
  const { user } = useAuth();

  const handleFollowToggle = () => {
    if (!user) {
      toast.error("Please login to follow");
      return;
    }

    if (following) {
      deleteFollowMutation.mutate({ id });
    } else {
      addFollowMutation.mutate({ location_id: id });
    }
  };

  return (
    <div className="mb-4 w-full flex justify-start lg:justify-end lg:px-8 px-6">
      <Button
        onClick={handleFollowToggle}
        disabled={deleteFollowMutation.isPending || addFollowMutation.isPending}
        className={`flex items-center gap-1 rounded-md text-sm font-medium transition-all duration-200
          ${following
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
          } px-3 py-1.5`}
      >
        <PlusIcon size={14} className={`${following ? "hidden" : "block"}`} />
        {deleteFollowMutation.isPending || addFollowMutation.isPending
          ? "Loading..."
          : following
          ? "Unfollow"
          : "Follow"}
      </Button>
    </div>
  );
};

export default Follow;
