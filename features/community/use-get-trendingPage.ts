import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetTrendingPage = () => {
  const query = useQuery({
    queryKey: ["trending-page"],
    queryFn: async () => {
      const response = await client.api.community["trending-page"].$get();

      if (!response.ok) throw new Error("Failed to get trending page data");

      const data = await response.json();

      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return query;
};