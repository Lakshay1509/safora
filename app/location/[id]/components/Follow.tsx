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

const Follow = ({ id, following, className }: Props & { className?: string }) => {
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
    <Button
      onClick={handleFollowToggle}
      disabled={deleteFollowMutation.isPending || addFollowMutation.isPending}
      className={`flex items-center gap-1 rounded-md text-sm font-medium transition-all duration-200 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-3 py-1.5 ${className}`}
    >
      {!following && <PlusIcon size={14} />}
      {deleteFollowMutation.isPending || addFollowMutation.isPending
        ? "Loading..."
        : following
        ? "Following"
        : "Follow"}
    </Button>
  );
};

export default Follow;
