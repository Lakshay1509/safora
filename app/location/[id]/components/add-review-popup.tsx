"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Star } from "lucide-react"
import { useGetDefaultUser } from "@/features/user/use-get-default"
import { addReview } from "@/features/reviews/use-add-review"
import { Textarea } from "@/components/ui/textarea"

interface AddReviewPopupProps {
  isOpen: boolean
  onClose: () => void
  locationId: string
}
type RatingValue = number | null;

interface Ratings {
  overall: RatingValue;
  women: RatingValue;
  transit: RatingValue;
  neighbourhood: RatingValue;
}

export function AddReviewPopup({ isOpen, onClose, locationId }: AddReviewPopupProps) {
  const [ratings, setRatings] = useState<Ratings>({
    overall: null,
    women: null,
    transit: null,
    neighbourhood: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
      data: userData,
      isLoading,
      isError
    } = useGetDefaultUser();
    
  const reviewMutation = addReview(locationId)

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      
      
      console.log(ratings);
      if(ratings.overall!==null){
        const reviewData = {
            general_score: ratings.overall,
            transit_score: ratings.transit,
            neighbourhood_score: ratings.neighbourhood,
            women_score: ratings.women,
      }

      await reviewMutation.mutateAsync(reviewData)

      }
      console.log("Review submitted successfully")
      
      setRatings({ overall: null, women: null, transit: null, neighbourhood: null })
      
      onClose()
    } catch (error) {
      setErrorMessage("Failed to submit review. Please try again later.")
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({
    label,
    value,
    onChange,
    isWomenScore = false,
  }: {
    label: string
    value: RatingValue
    onChange: (value: number) => void
    isWomenScore?: boolean
  }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-base font-medium" style={{ color: "#EAEAEA" }}>
          {label}
        </span>
        <span className="text-lg font-semibold" style={{ color: "#EAEAEA" }}>
          {value || ''}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors duration-200 hover:scale-110"
          >
            <Star
              className="h-8 w-8"
              fill={value && star <= value ? (isWomenScore ? "#3B82F6" : "#10B981") : "transparent"}
              stroke={value && star <= value ? (isWomenScore ? "#3B82F6" : "#10B981") : "#2A2A2A"}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card
        className="w-full max-w-md text-white"
        style={{
          backgroundColor: "#1A1A1A",
          borderColor: "#2A2A2A",
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold" style={{ color: "#EAEAEA" }}>
            Add Review
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-700">
            <X className="h-4 w-4" style={{ color: "#9CA3AF" }} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200 text-sm">
              {errorMessage}
            </div>
          )}
          
          <StarRating
            label="Overall Score"
            value={ratings.overall}
            onChange={(value) => handleRatingChange("overall", value)}
          />
          {userData !==undefined && userData.userData.gender==='female' && (<StarRating
            label="Women Score"
            value={ratings.women}
            onChange={(value) => handleRatingChange("women", value)}
            isWomenScore={true}
          />)}
          <StarRating
            label="Transit Score"
            value={ratings.transit}
            onChange={(value) => handleRatingChange("transit", value)}
          />
          <StarRating
            label="Neighbourhood Score"
            value={ratings.neighbourhood}
            onChange={(value) => handleRatingChange("neighbourhood", value)}
          />
                  
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              style={{
                borderColor: "#2A2A2A",
                color: "#9CA3AF",
                backgroundColor: "transparent",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              style={{
                backgroundColor: "#3B82F6",
                color: "white",
              }}
              disabled={isSubmitting || ratings.overall === null}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
