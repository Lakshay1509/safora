import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.referral.add)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.referral.add)["$post"]>["json"];

export const addCode = () => {
 

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {

      try {
        const response = await client.api.referral.add["$post"]({
          json,
         
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add referral");
        }

        return response.json();
      } catch (error) {
        console.error("API request error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Referral added successfully");      
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add referral");
    },
  });
};
