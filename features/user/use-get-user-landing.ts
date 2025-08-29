import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetDefaultUserLanding = (options?: { enabled?: boolean })=>{
    const query = useQuery({
    
        queryKey: ["user"],
        enabled: options?.enabled ?? true,
        queryFn: async ()=>{
            const response = await client.api.user.default.$get();

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        },
        retry:1
    });

    return query;
}