import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetSubComments = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["post-sub-comments",id],
        queryFn: async ()=>{
            const response = await client.api.post_comments.sub_comment[":parentCommentID"].$get({
                param:{parentCommentID:id},
            });

            if(!response.ok) throw new Error("failed to get post comments");

            const data = await response.json();

            return data;
        }
    });

    return query;
}