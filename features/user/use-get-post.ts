import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetUserPosts = ()=>{
    const query = useQuery({
        queryKey: ["userPosts"],
        queryFn: async ()=>{
            const response = await client.api.user.posts.$get();

            if(!response.ok) throw new Error("Failed to get user posts");

            const data = await response.json();

            return data;
        }
    });

    return query;
}