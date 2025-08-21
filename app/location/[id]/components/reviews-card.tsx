"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationReview } from "@/features/location/use-get-location-review";
import { useParams } from "next/navigation";
import {Plus, Edit, Trash2, Sun, Moon} from "lucide-react"
import { AddReviewPopup } from "./add-review-popup";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGetReviewByUser } from "@/features/reviews/use-get-byUser-byLocation";
import { useDeleteReview } from "@/features/reviews/use-delete-review";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export function ReviewsCard() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [timeMode, setTimeMode] = useState<"DAY" | "NIGHT">("DAY");
  const params = useParams();
  const id = params.id as string

  const {
    data,
    isLoading,
    isError
  } = useGetLocationReview(id);
  
  // Get the user's review for this location
  const {
    data: userReviewData,
    isLoading: isUserReviewLoading,
    isError: isUserReviewError,
    error: userReviewError
  } = useGetReviewByUser(id,timeMode);

  const deleteReviewMutation = useDeleteReview(id,timeMode);

  
  const hasUserReview = !!userReviewData?.review && !isUserReviewError;

  // Reset popup when changing time mode
  useEffect(() => {
    // Close the popup if it's open when switching modes
    if (isPopupOpen) {
      setIsPopupOpen(false);
    }
  }, [timeMode]);

  const handleDeleteReview = () => {
    deleteReviewMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        
        
      }
    });
  };

  const ratings = {
    overall: data?.locationReview.avg_general,
    women: data?.locationReview.avg_women_safety,
    transit: data?.locationReview.avg_transit,
    neighbourhood: data?.locationReview.avg_neighbourhood,
  }

  // Toggle function for day/night mode
  const toggleDayNightMode = () => {
    setTimeMode(prev => prev === "DAY" ? "NIGHT" : "DAY");
  };

  const BarRating = ({ rating, isWomenScore = false }: { rating: number; isWomenScore?: boolean }) => {
  const percentage = (rating / 5) * 100;

  // Pick color dynamically
  let barColor = "";
  if (rating >= 4) {
    barColor = "#10B981"; // green
  } else if (rating >= 3) {
    barColor = "#FACC15"; // yellow
  } else {
    barColor = "#EF4444"; // red
  }

  return (
    <div className="flex items-center justify-between">
      <div
        className="flex-1 h-2 rounded-full mr-4"
        style={{ backgroundColor: "#2A2A2A" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            backgroundColor:barColor,
            width: `${percentage}%`,
          }}
        />
      </div>
      <span
        className="text-lg font-semibold min-w-[2.5rem] text-right"
        style={{ color: "#EAEAEA" }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
};



  return (
    <>
    <Card
      className="w-full text-white bg-white/5 backdrop-blur-md border border-white/10 h-80 lg:h-110 transition-colors duration-200 hover:shadow-lg"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xl font-bold" style={{ color: "#EAEAEA" }}>
            Reviews ({data?.locationReview.review_count})
          </CardTitle>
          
          {/* Day/Night Toggle */}
          <Button 
            onClick={toggleDayNightMode} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border border-white/20 bg-white/10"
          >
            {timeMode === "DAY" ? (
              <>
                <Sun className="h-4 w-4" />
                <span>DAY</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>NIGHT</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="flex gap-2">
          {hasUserReview && (
            <Button
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setIsPopupOpen(true)}
            className="flex items-center gap-2"
            style={{
              backgroundColor: "#3B82F6",
              color: "white",
            }}
          >
            {hasUserReview ? (
              <>
                <Edit className="h-4 w-4" />
                Edit Review
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Review
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 mt-10">
        <div className="space-y-4">
          <div className="space-y-3">
            <span className="text-xl font-medium" style={{ color: "#EAEAEA" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Overall Safety Score
            </span>
            {!ratings.overall && <p>No reviews</p>}
            {ratings.overall && <BarRating rating={Number(ratings.overall)} />}
          </div>
          <div className="space-y-3">
            <span className="text-xl font-medium" style={{ color: "#EAEAEA" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Women Safety Score
            </span>
            {!ratings.women && <p>No reviews</p>}
            {ratings.women && <BarRating rating={Number(ratings.women)} isWomenScore={true} />}
          </div>
          <div className="space-y-3">
            <span className="text-base font-medium" style={{ color: "#EAEAEA" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Transit Safety Score
            </span>
            {!ratings.transit && <p>No reviews</p>}
            {ratings.transit && <BarRating rating={Number(ratings.transit)} />}
          </div>
          <div className="space-y-3">
            <span className="text-base font-medium" style={{ color: "#EAEAEA" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Neighbourhood Safety Score 
            </span>
            {!ratings.neighbourhood && <p>No reviews</p>}
            {ratings.neighbourhood && <BarRating rating={Number(ratings.neighbourhood)} />}
          </div>
        </div>
      </CardContent>
    </Card>
     <AddReviewPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        locationId={id} 
        existingReview={userReviewData?.review || null} 
        isEdit={hasUserReview}
        timeMode={timeMode} 
        key={`review-popup-${timeMode}`} // Add key to force re-render when timeMode changes
     />

     {/* Delete Confirmation Dialog */}
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This will permanently delete your review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReview}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
