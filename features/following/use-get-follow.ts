import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { useAuth } from "@/contexts/AuthContext";


export const useGetFollow = (id:string)=>{
    const {user} = useAuth();
    const query = useQuery({

        enabled :!!id && !!user,
        queryKey: ["follow",id],
        queryFn: async ()=>{
            const response = await client.api.following[":id"].$get({
                param:{id},
            });

            if(!response.ok) throw new Error("failed to get follow");

            const data = await response.json();

            return data;
        },
        retry:1
    });

    return query;
}