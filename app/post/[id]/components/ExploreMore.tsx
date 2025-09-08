"use client"

import { useGetLocation } from "@/features/location/use-get-location"
import Link from "next/link";

interface Props {
    id: string
}

const ExploreMore = ({ id }: Props) => {

    const { data } = useGetLocation(id);

    return (
        <div className="fixed bottom-4 left-4 right-4 z-20 bg-white rounded-lg shadow-md px-3 py-2 flex items-center justify-between lg:hidden">
            <div>
                <p className="text-xs text-gray-600">Discover more about</p>
                <h2 className="font-semibold text-sm text-gray-800">{data?.location.name}</h2>
            </div>
            <Link
                href={`/location/${data?.location.id}`}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
            >
                Explore
            </Link>
        </div>

    )
}

export default ExploreMore