"use client"

import { useGetLocation } from "@/features/location/use-get-location"
import { useParams } from "next/navigation";

const page = () => {
    const params = useParams();
    const id = params.id as string

    const {
        data,
        isLoading,
        isError
    } = useGetLocation(id);
  return (
    <div>
        {data?.location.city}
    </div>
  )
}

export default page