import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetUserComments = ()=>{
    const query = useQuery({
        queryKey: ["userComments"],
        queryFn: async ()=>{
            const response = await client.api.user.comments.$get();

            if(!response.ok) throw new Error("Failed to get user comments");

            const data = await response.json();

            return data;
        }
    });

    return query;
}