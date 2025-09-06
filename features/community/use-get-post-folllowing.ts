import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"

type Props = {
    limit?: string;
}

export const useGetFollowingPost = ({ limit }: Props)=>{
    const query = useQuery({
        queryKey: ["following-post", { limit }],
        queryFn: async ()=>{
            const response = await client.api.community.following.$get({
                query: {
                    limit,
                }
            });

            if(!response.ok) throw new Error("failed to get post");

            const data = await response.json();

            return data;
        }
    });

    return query;
}