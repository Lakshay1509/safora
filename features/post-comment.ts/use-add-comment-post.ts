import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.post_comments.add)[":id"]["$post"]>
type RequestType = InferRequestType<(typeof client.api.post_comments.add)[":id"]["$post"]>["json"]

export const addCommenttoPost = (postId:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.post_comments.add[":id"]["$post"]({
                json,
                param:{id:postId}
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add comment");
            }

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["post-comments"]});
            toast.success("Comment added successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to add comment");
        }
    })
}