"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useGetLocation } from "@/features/location/use-get-location";
import { useParams } from "next/navigation";
import { MapPin, Sun, Moon } from "lucide-react"
import { useGetLocationReview } from "@/features/location/use-get-location-review";
import { Skeleton } from "@/components/ui/skeleton";
import Follow from "./Follow";

export function AreaCard() {
  const params = useParams();
  const id = params.id as string

  const {
    data,
    isLoading,
    isError
  } = useGetLocation(id);

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
  const dayPercentage = Math.round((daySafeValue / 5) * 100);

  // Check if there are any night reviews
  const hasNightReviews = nightData && nightData.review_count > 0;
  // Calculate night safety data from API response
  const nightSafeValue = hasNightReviews ? nightData?.avg_general || 0 : 0;
  const nightPercentage = Math.round((nightSafeValue / 5) * 100);

  const getSafetyColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };


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
    <Card className="w-full bg-white border border-white/10">
      <CardContent className="pt-0 flex flex-col lg:flex-row w-full justify-between gap-4 lg:gap-0">
        {/* Left Column: Identity & Social Proof (60%) */}
        <div className="flex flex-col w-full lg:w-[60%]">
          <div className="flex justify-between items-start">
            <div>
              {/* Element A: Title Row */}
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-[#111827]" />
                <h1 className="text-2xl font-bold text-[#111827]">{data?.location?.name}</h1>
              </div>

              {/* Element B: Subtitle */}
              <div className="mt-1 ml-8">
                <p className="text-sm font-medium text-[#6B7280]">
                  {data?.location?.country}, {data?.location?.city}
                </p>
              </div>
            </div>

            {/* Mobile Follow Button */}
            <div className="lg:hidden">
              <Follow id={id} following={data?.isFollowing ?? false} />
            </div>
          </div>

          {/* Element C: Social Meta Data */}
          <div className="mt-4 ml-8 flex items-center gap-2 text-[13px] text-[#6B7280]">
            <span>{data?.followers?.followers_count ?? 0} Followers</span>
            <span>•</span>
            <span>{data?.posts ?? 0} Posts</span>
            <span>•</span>
            <span>{data?.comments ?? 0} Comments</span>
          </div>
        </div>

        {/* Right Column: Safety Insight (40%) */}
        <div className="flex flex-col w-full lg:w-[40%] item-center lg:items-end gap-4 ml-8">
          {/* Element D: Action Button (Desktop) */}
          <div className="hidden lg:block">
            <Follow id={id} following={data?.isFollowing ?? false} />
          </div>

          {/* Element E: Safety Meters */}
          <div className="w-full max-w-[240px] space-y-3">
            {/* Day Safety */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Sun className="h-4 w-4" /> Day
                </span>
                <span className="font-bold text-slate-700">{hasDayReviews ? `${dayPercentage}%` : "N/A"}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getSafetyColor(dayPercentage)}`}
                  style={{ width: `${hasDayReviews ? dayPercentage : 0}%` }}
                />
              </div>
            </div>

            {/* Night Safety */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Moon className="h-4 w-4" /> Night
                </span>
                <span className="font-bold text-slate-700">{hasNightReviews ? `${nightPercentage}%` : "N/A"}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getSafetyColor(nightPercentage)}`}
                  style={{ width: `${hasNightReviews ? nightPercentage : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

