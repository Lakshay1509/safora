import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { useAuth } from "@/contexts/AuthContext";


export const useGetDefaultUser = ()=>{
    const {user} = useAuth();
    const query = useQuery({
        enabled : !!user,
        queryKey: ["user"],
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