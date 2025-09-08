"use client"

import { useGetLocationStats } from "@/features/location/use-get-location-stats"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useGetLocation } from "@/features/location/use-get-location";
import Link from "next/link";


interface Props{
    id:string,
}

const TrendingCard = ({id}:Props) => {

    const {data,isLoading,isError} = useGetLocationStats(id);
    const {data:location_data} = useGetLocation(id);

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <p>Loading stats...</p>
                </CardContent>
            </Card>
        )
    }

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <p>Error loading stats.</p>
                </CardContent>
            </Card>
        )
    }
    
  return (
    <Card>
        <CardContent>
            <Link href={`/location/${location_data?.location.id}`} className="hover:underline">
            <div className="space-y-1 text-sm">
                <h1 className="font-bold">{location_data?.location.name}</h1>
                <div className="flex items-center justify-between">
                    <p className="text-sm ">Posts</p>
                    <p className="text-sm ">{data?.posts ?? 0}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm ">Comments</p>
                    <p className="text-sm ">{data?.comments ?? 0}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm ">Followers</p>
                    <p className="text-sm ">{data?.followers?.followers_count ?? 0}</p>
                </div>
            </div>
            </Link>
        </CardContent>
    </Card>
  )
}

export default TrendingCard