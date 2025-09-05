"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link";
import { useGetUserFollowing } from "@/features/user/use-get-following";

export function ProfileFollowingCard() {
  
  const {
      data,
      isLoading,
      isError
  } = useGetUserFollowing();

  if (isLoading) {
    return (
      <Card className="w-full bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
            Following
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading followed locations...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto">
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
            Following
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading followed locations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="w-full  bg-white border border-white/10 max-h-80 transition-colors duration-200 hover:shadow-lg overflow-x-auto"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          Following ({data?.following.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {data?.following && data.following.length > 0 ? (
          <ul className="space-y-2">
            {data.following.map((follow) => (
              <li key={follow.id}>
                <Link href={`/location/${follow.locations.name}`} className="block p-4 rounded-md bg-[#F8F4EF] hover:underline">
                    <h3 className="font-semibold text-gray-900 truncate">{follow.locations.name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">You are not following any locations yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
     