import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";


export const useGetCode = (open:boolean)=>{
    const {user} = useAuth();
    const query = useQuery({
        enabled : !!user && !!open,
        queryKey: ["code"],
        queryFn: async ()=>{
            const response = await client.api.referral.create.$get();

            if(!response.ok) {
                toast.error("Failed to get code");
                throw new Error("failed to get code");

            }

            const data = await response.json();

            return data;
        },
    });

    return query;
}