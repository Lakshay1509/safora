"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Star, Sun, Moon } from "lucide-react"
import { useGetDefaultUser } from "@/features/user/use-get-default"
import { addReview } from "@/features/reviews/use-add-review"
import { Textarea } from "@/components/ui/textarea"

interface AddReviewPopupProps {
  isOpen: boolean
  onClose: () => void
  locationId: string
  existingReview?: any | null
  isEdit?: boolean
}
type RatingValue = number | null;
type TimeOfDay = "DAY" | "NIGHT" | null;

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
  isEdit = false 
}: AddReviewPopupProps) {
  const [ratings, setRatings] = useState<Ratings>({
    overall: null,
    women: null,
    transit: null,
    neighbourhood: null
  })
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
      data: userData,
      isLoading,
      isError
    } = useGetDefaultUser();
    
  const reviewMutation = addReview(locationId)

  // Populate form with existing review data when in edit mode
  useEffect(() => {
    if (existingReview && isEdit) {
      setRatings({
        overall: existingReview.general_score || null,
        women: existingReview.women_score || null,
        transit: existingReview.transit_score || null,
        neighbourhood: existingReview.neighbourhood_score || null
      });
      setTimeOfDay(existingReview.time_of_day || null);
    }
  }, [existingReview, isEdit]);

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrorMessage(null)
      
      if(ratings.overall !== null && timeOfDay !== null){
        const reviewData = {
            general_score: ratings.overall,
            transit_score: ratings.transit,
            neighbourhood_score: ratings.neighbourhood,
            women_score: ratings.women,
            time_of_day: timeOfDay
        }

        await reviewMutation.mutateAsync(reviewData)
      }
      console.log(`Review ${isEdit ? 'updated' : 'submitted'} successfully`)
      
      setRatings({ overall: null, women: null, transit: null, neighbourhood: null })
      setTimeOfDay(null)
      
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

  const TimeOfDaySelector = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-base font-medium" style={{ color: "#EAEAEA" }}>
          Time of Day
        </span>
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          variant='ghost'
          onClick={() => setTimeOfDay("DAY")}
          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
            timeOfDay === "DAY" 
              ? "bg-amber-500 text-black" 
              : "bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <Sun className="h-5 w-5" />
          <span>Day</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setTimeOfDay("NIGHT")}
          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
            timeOfDay === "NIGHT" 
              ? "bg-indigo-600 text-white" 
              : "bg-transparent border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <Moon className="h-5 w-5" />
          <span>Night</span>
        </Button>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0  bg-white/5 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card
        className="w-full max-w-md text-white"
        style={{
          backgroundColor: "#1A1A1A",
          borderColor: "#2A2A2A",
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold" style={{ color: "#EAEAEA" }}>
            {isEdit ? 'Edit Review' : 'Add Review'}
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
          
          <TimeOfDaySelector />
          
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
              disabled={isSubmitting || ratings.overall === null || timeOfDay === null}
            >
              {isSubmitting ? "Submitting..." : (isEdit ? "Update Review" : "Submit Review")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
