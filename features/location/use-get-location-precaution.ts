import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetLocationPrecautions = (id:string)=>{
    const query = useQuery({
        enabled :!!id,
        queryKey: ["locationPreacautions",id],
        queryFn: async ()=>{
            const response = await client.api.location.precautions[":id"].$get({
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