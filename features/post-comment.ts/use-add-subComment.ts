import { InferRequestType,InferResponseType } from "hono";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.post_comments.sub_comment.add)[":postId"][":parentCommentId"]["$post"]>
type RequestType = InferRequestType<(typeof client.api.post_comments.sub_comment.add)[":postId"][":parentCommentId"]["$post"]>["json"]

export const addSubCommenttoPost = (postId:string,parentCommentId:string)=>{

    const queryClient = useQueryClient();

    return useMutation<ResponseType,Error,RequestType>({

        mutationFn : async(json)=>{
            const response = await client.api.post_comments.sub_comment.add[":postId"][":parentCommentId"]["$post"]({
                json,
                param:{postId:postId,parentCommentId:parentCommentId}
            });

             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add comment");
            }

            return response.json();
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["post-sub-comments"]});
            toast.success("Comment added successfully");
        },
        onError:(error)=>{
            console.log(error);
            toast.error("Failed to add comment");
        }
    })
}