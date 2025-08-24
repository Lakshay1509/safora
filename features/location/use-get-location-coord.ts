import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono"


export const useGetLocationByCoord = (lon: number, lat: number) => {
    const query = useQuery({
        enabled: !!lon && !!lat, 
        queryKey: ["location", lon, lat], 
        
        queryFn: async () => {
            const response = await client.api.location.locationsByCoord.$get({
                query: {
                    lon,
                    lat
                },
            });

            if(!response.ok) throw new Error("failed to get location");

            const data = await response.json();

            return data;
        },
        retry:1
    });

    return query;
}