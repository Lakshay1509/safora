import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.post.add)[":location_id"]["$post"]>;
type RequestType = InferRequestType<(typeof client.api.post.add)[":location_id"]["$post"]>["json"];

export const addPost = (location_id: string) => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {

      try {
        const response = await client.api.post.add[":location_id"]["$post"]({
          json,
          param: { location_id: location_id }
        
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add post");
        }

        return response.json();
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Post added successfully");
      queryClient.invalidateQueries({ queryKey: ["location-post"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
      queryClient.invalidateQueries({ queryKey: ["recent-post"] });
      queryClient.invalidateQueries({ queryKey: ["location-stats"] });
      
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to post");
    },
  });
};
