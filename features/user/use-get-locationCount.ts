import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetUserLocationCount = ()=>{
    const query = useQuery({
        queryKey: ["userLocationCount"],
        queryFn: async ()=>{
            const response = await client.api.user["locations-count"].$get();

            if(!response.ok) throw new Error("Failed to get user location counts");

            const data = await response.json();

            return data;
        }
    });

    return query;
}