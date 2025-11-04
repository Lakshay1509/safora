import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { useAuth } from "@/contexts/AuthContext";


export const useGetLocationMetrics = (id:string)=>{
     const {user} = useAuth();
    const query = useQuery({
        enabled :!!id && !!user ,
        queryKey: ["locationMetrics",id],
        queryFn: async ()=>{
            const response = await client.api.location.extra_info[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        },
        retry:2
    });

    return query;
}