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
import { Skeleton } from "./ui/skeleton";


interface Props{
    id:string,
}

const TrendingCard = ({id}:Props) => {

    const {data,isLoading,isError} = useGetLocationStats(id);
    const {data:location_data} = useGetLocation(id);

    if (isLoading) {
        return (
            <TrendingCard.Skeleton />
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
            <div className="space-y-1 text-sm ">
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

TrendingCard.Skeleton = function TrendingCardSkeleton() {
    return (
        <Card>
            <CardContent>
                <div className="space-y-2 pt-6">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex items-center justify-between pt-2">
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-4 w-[20px]" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[70px]" />
                        <Skeleton className="h-4 w-[20px]" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[60px]" />
                        <Skeleton className="h-4 w-[20px]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TrendingCard