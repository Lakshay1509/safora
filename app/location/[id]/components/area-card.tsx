"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGetLocation } from "@/features/location/use-get-location";
import { useParams } from "next/navigation";
import { MapPin } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { useGetLocationReview } from "@/features/location/use-get-location-review";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useGetLocationStats } from "@/features/location/use-get-location-stats";
import Follow from "./Follow";

export function AreaCard() {
  const params = useParams();
  const id = params.id as string

  const {
    data,
    isLoading,
    isError
  } = useGetLocation(id);

  // useEffect(() => {
  //   if (data?.location.name) {
  //     document.title = `${data.location.name} - Safe Or Not`;
  //   }
  // }, [data]);

  const { data: stats, isLoading: stats_loading, isError: stats_error } = useGetLocationStats(id);

  const {
    data: dayData,
    isLoading: isDayLoading,
    isError: isDayError
  } = useGetLocationReview(id, "DAY");

  const {
    data: nightData,
    isLoading: isNightLoading,
    isError: isNightError
  } = useGetLocationReview(id, "NIGHT");

  // Check if there are any day reviews
  const hasDayReviews = dayData && dayData.review_count > 0;
  // Calculate day safety data from API response
  const daySafeValue = hasDayReviews ? dayData?.avg_general || 0 : 0;
  const daySafetyData = [
    { name: "Safe", value: ((daySafeValue) / 5) * 100, color: "#10B981" },
    { name: "Unsafe", value: ((5 - daySafeValue) / 5) * 100, color: "#374151" },
  ];

  // Check if there are any night reviews
  const hasNightReviews = nightData && nightData.review_count > 0;
  // Calculate night safety data from API response
  const nightSafeValue = hasNightReviews ? nightData?.avg_general || 0 : 0;
  const nightSafetyData = [
    { name: "Safe", value: ((nightSafeValue) / 5) * 100, color: "#10B981" },
    { name: "Unsafe", value: ((5 - nightSafeValue) / 5) * 100, color: "#374151" },
  ];


  if (isLoading) {
    return (
      <Card className="w-full bg-white border border-white/10">
        <CardContent className="pt-0 flex flex-col lg:flex-row w-full justify-between gap-4 lg:gap-0">
          <div className="space-y-2 lg:space-y-4">
            <div className="flex items-center gap-x-2 lg:gap-x-3 text-xl sm:text-2xl lg:text-3xl font-semibold">
              <Skeleton className="h-8 w-8 bg-gray-300 " />
              <Skeleton className="h-7 w-48 bg-gray-300" />
            </div>
            <div className="text-black ml-8 sm:ml-10 lg:ml-12">
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (

    <Card className="w-full bg-white border border-white/10" >

      <CardContent className="pt-0 flex flex-col lg:flex-row w-full justify-between gap-4 lg:gap-0">
        <div className="space-y-2 lg:space-y-4">
          <h2 className="flex items-center gap-x-2 lg:gap-x-3 text-xl sm:text-2xl lg:text-3xl font-semibold">
            <MapPin className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
            {data?.location.name}
          </h2>


          <div className="text-black ml-8 sm:ml-10 lg:ml-12">
            <span className="text-sm sm:text-base">{data?.location.country}, {data?.location.city}</span>
          </div>
          <div className="ml-8 sm:ml-10 lg:ml-12 flex items-center space-x-6 text-gray-700 text-sm font-medium">
            <p className="flex items-center space-x-1">
              <span className="font-semibold">{stats?.followers?.followers_count}</span>
              <span className="text-gray-500">Followers</span>
            </p>
            <div className="h-4 w-px bg-gray-300"></div>
            <p className="flex items-center space-x-1">
              <span className="font-semibold">{stats?.posts}</span>
              <span className="text-gray-500">Posts</span>
            </p>
            <div className="h-4 w-px bg-gray-300"></div>
            <p className="flex items-center space-x-1">
              <span className="font-semibold">{stats?.comments}</span>
              <span className="text-gray-500">Comments</span>
            </p>
          </div>


        </div>



        <div>
          <Follow id={id} />
          <div className="flex flex-row justify-between px-8 lg:items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium" style={{ color: "#000000" }}>
                  Day
                </p>
                <p className="text-xs" style={{ color: "#000000" }}>
                  {isDayLoading ? "Loading..." : hasDayReviews ? `${Math.round(((daySafeValue) / 5) * 100)}% safe` : "No reviews"}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={daySafetyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={14}
                      outerRadius={20}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {daySafetyData.map((entry, index) => (
                        <Cell key={`day-cell-${index}`} fill={hasDayReviews ? entry.color : "#CCCCCC"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium" style={{ color: "#000000" }}>
                  Night
                </p>
                <p className="text-xs" style={{ color: "#000000" }}>
                  {isNightLoading ? "Loading..." : hasNightReviews ? `${Math.round(((nightSafeValue) / 5) * 100)}% safe` : "No reviews"}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nightSafetyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={14}
                      outerRadius={20}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {nightSafetyData.map((entry, index) => (
                        <Cell key={`night-cell-${index}`} fill={hasNightReviews ? entry.color : "#CCCCCC"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

