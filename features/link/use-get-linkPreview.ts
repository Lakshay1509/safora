import { InferRequestType, InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<(typeof client.api['link-preview'])['fetch']["$post"]>

export const useGetLinkPreview = (url: string) => {
  return useQuery<ResponseType, Error>({
    queryKey: ["link-preview", url],
    queryFn: async () => {
      const response = await client.api['link-preview']['fetch']["$post"]({
        json: { url },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get link");
      }

      return response.json();
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 60, 
    gcTime: 1000 * 60 * 60 * 24, 
  });
};