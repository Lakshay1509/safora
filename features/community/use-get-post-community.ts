import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetPostCommunity = () => {
  const query = useInfiniteQuery({
    queryKey: ["recent-post"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client.api.community.recent.$get({
        query: {
          page: pageParam.toString(),
          limit: "10",
        },
      });

      if (!response.ok) throw new Error("failed to get post");

      const data = await response.json();

      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  return query;
};