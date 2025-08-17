"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationReview } from "@/features/location/use-get-location-review";
import { useParams } from "next/navigation";

export function ReviewsCard() {
  const params = useParams();
  const id = params.id as string

  const {
    data,
    isLoading,
    isError
  } = useGetLocationReview(id);

  const ratings = {
    overall: data?.locationReview.avg_general,
    women: data?.locationReview.avg_women_safety,
    transit: data?.locationReview.avg_transit,
    neighbourhood: data?.locationReview.avg_neighbourhood,
  }

  const BarRating = ({ rating, isWomenScore = false }: { rating: number; isWomenScore?: boolean }) => {
    const percentage = (rating / 5) * 100

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1 h-2 rounded-full mr-4" style={{ backgroundColor: "#2A2A2A" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: isWomenScore ? "#3B82F6" : "#10B981",
              width: `${percentage}%`,
            }}
          />
        </div>
        <span className="text-lg font-semibold min-w-[2.5rem] text-right" style={{ color: "#EAEAEA" }}>
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <Card
      className="w-full text-white bg-white/5 backdrop-blur-md border border-white/10 h-80 lg:h-96 transition-colors duration-200 hover:shadow-lg"

    >
      <CardHeader>
        <CardTitle className="text-xl font-bold" style={{ color: "#EAEAEA" }}>
          Reviews ({data?.locationReview.review_count})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <span className="text-xl font-medium" style={{ color: "#EAEAEA" }}>
              Overall Safety Score
            </span>
            {!ratings.overall && <p>No reviews</p>}
            {ratings.overall && <BarRating rating={Number(ratings.overall)} />}
          </div>
          <div className="space-y-3">
            <span className="text-xl font-medium" style={{ color: "#EAEAEA" }}>
              Women Safety Score
            </span>
            {!ratings.women && <p>No reviews</p>}
            {ratings.women && <BarRating rating={Number(ratings.women)} isWomenScore={true} />}
          </div>
          <div className="space-y-3">
            <span className="text-base font-medium" style={{ color: "#EAEAEA" }}>
              Transit Safety Score
            </span>
            {!ratings.transit && <p>No reviews</p>}
            {ratings.transit && <BarRating rating={Number(ratings.transit)} />}
          </div>
          <div className="space-y-3">
            <span className="text-base font-medium" style={{ color: "#EAEAEA" }}>
              Neighbourhood Safety Score
            </span>
            {!ratings.neighbourhood && <p>No reviews</p>}
            {ratings.neighbourhood && <BarRating rating={Number(ratings.neighbourhood)} />}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
