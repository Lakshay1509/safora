import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.achievment.addBadge)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.achievment.addBadge)["$post"]>["json"];

export const addBadge = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {

      try {
        const response = await client.api.achievment.addBadge["$post"]({
          json
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add badge");
        }


        return response.json();
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Badge added successfully");
    //   queryClient.invalidateQueries({ queryKey: ["recent-article"] });
    //   queryClient.invalidateQueries({ queryKey: ["post"] });
    //   queryClient.invalidateQueries({ queryKey: ["recent-post"] });
    //   queryClient.invalidateQueries({ queryKey: ["location-stats"] });
      
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add badge");
    },
  });
};
