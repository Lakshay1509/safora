"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Star } from "lucide-react"
import { useGetDefaultUser } from "@/features/user/use-get-default"
import { addReview } from "@/features/reviews/use-add-review"
import { EditReview } from "@/features/reviews/use-edit-review" 


interface AddReviewPopupProps {
  isOpen: boolean
  onClose: () => void
  locationId: string
  existingReview?: any | null
  isEdit?: boolean
  timeMode: "DAY" | "NIGHT"
}
type RatingValue = number | null;

interface Ratings {
  overall: RatingValue;
  women: RatingValue;
  transit: RatingValue;
  neighbourhood: RatingValue;
}

export function AddReviewPopup({ 
  isOpen, 
  onClose, 
  locationId, 
  existingReview = null, 
  isEdit = false,
  timeMode
}: AddReviewPopupProps) {
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
    
  // Use different mutation based on isEdit flag
  const addReviewMutation = addReview(locationId, timeMode)
  const editReviewMutation = EditReview(locationId, timeMode)
  const reviewMutation = isEdit ? editReviewMutation : addReviewMutation

  // Populate form with existing review data when in edit mode
  useEffect(() => {
    if (existingReview && isEdit) {
      setRatings({
        overall: existingReview.general_score || null,
        women: existingReview.women_safety_score || null,
        transit: existingReview.transit_score || null,
        neighbourhood: existingReview.neighbourhood_score || null
      });
    } else if (!isEdit) {
      // Reset ratings when not in edit mode
      setRatings({
        overall: null,
        women: null,
        transit: null,
        neighbourhood: null
      });
    }
  }, [existingReview, isEdit, timeMode]); // Add timeMode as a dependency

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      
      if(ratings.overall !== null){
        const reviewData = {
            general_score: ratings.overall,
            transit_score: ratings.transit,
            neighbourhood_score: ratings.neighbourhood,
            women_score: ratings.women,
        }
        
        await reviewMutation.mutateAsync(reviewData)
      }
      console.log(`Review ${isEdit ? 'updated' : 'submitted'} successfully`)
      
      setRatings({ overall: null, women: null, transit: null, neighbourhood: null })
      
      onClose()
    } catch (error) {
      setErrorMessage(`Failed to ${isEdit ? 'update' : 'submit'} review. Please try again later.`)
      console.error(`Error ${isEdit ? 'updating' : 'submitting'} review:`, error)
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
        <span className="text-base font-medium" style={{ color: "#374151" }}>
          {label}
        </span>
        <span className="text-lg font-semibold" style={{ color: "#111827" }}>
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
              stroke={value && star <= value ? (isWomenScore ? "#3B82F6" : "#10B981") : "#D1D5DB"}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card
        className="w-full max-w-md text-gray-800"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E7EB",
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold" style={{ color: "#111827" }}>
            {isEdit ? 'Edit Review' : 'Add Review'} ({timeMode === "DAY" ? "Daytime" : "Nighttime"})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-gray-100">
            <X className="h-4 w-4" style={{ color: "#6B7280" }} />
          </Button>
        </CardHeader>
        {userData !==undefined && userData.userData.gender===null &&(
          <div className="text-center">Please complete the profile to continue.</div>
        )}
        {userData !==undefined && userData.userData.gender!==null && (<CardContent className="space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 text-sm">
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
                borderColor: "#E5E7EB",
                color: "#6B7280",
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
              {isSubmitting ? "Submitting..." : (isEdit ? "Update Review" : "Submit Review")}
            </Button>
          </div>
        </CardContent>)}
      </Card>
    </div>
  )
}