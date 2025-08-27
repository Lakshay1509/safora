import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<(typeof client.api.user.set_gender)["$put"]>
type RequestType = InferRequestType<(typeof client.api.user.set_gender)["$put"]>["json"]

export const useUpdateUserGender = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async(json) => {
            const response = await client.api.user.set_gender["$put"]({
                json,
            });

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Gender updated successfully");
        },
        onError: (error) => {
            console.log(error);
            toast.error("Failed to update gender");
        }
    });
}