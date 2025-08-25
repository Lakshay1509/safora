import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetDefaultUser = ()=>{
    const query = useQuery({
    
        queryKey: ["user"],
        queryFn: async ()=>{
            const response = await client.api.user.default.$get();

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        },
        retry:2
    });

    return query;
}