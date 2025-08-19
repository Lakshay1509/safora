import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";

// Correct type inference for DELETE operation
type ResponseType = InferResponseType<
  (typeof client.api.comment.delete)["$delete"]
>;

type RequestType = InferRequestType<
  (typeof client.api.comment.delete)["$delete"]
>["json"];

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.comment.delete["$delete"]({
                json
            });

            if (!response.ok) {
                throw new Error("Failed to delete comment");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["locationComments"] });
        },
        onError: (error) => {
            console.log("Delete comment error:", error);
        }
    });
};
