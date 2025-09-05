import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetUserFollowing = ()=>{
    const query = useQuery({
        queryKey: ["userFollwoing"],
        queryFn: async ()=>{
            const response = await client.api.user.following.$get();

            if(!response.ok) throw new Error("Failed to get user following");

            const data = await response.json();

            return data;
        }
    });

    return query;
}