import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.article.add)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.article.add)["$post"]>["form"];

export const addArticle = () => {
  // const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (data) => {

      try {
        const response = await client.api.article.add["$post"]({
          form:data
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add article");
        }

        return response.json();
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Article added successfully");
    //   queryClient.invalidateQueries({ queryKey: ["location-post"] });
    //   queryClient.invalidateQueries({ queryKey: ["post"] });
    //   queryClient.invalidateQueries({ queryKey: ["recent-post"] });
    //   queryClient.invalidateQueries({ queryKey: ["location-stats"] });
      
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to post");
    },
  });
};
