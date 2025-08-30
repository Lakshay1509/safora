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
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function ReviewsCard() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [timeMode, setTimeMode] = useState<"DAY" | "NIGHT">("DAY");
  const params = useParams();
  const id = params.id as string
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();
    
    // Get current user ID
    useEffect(() => {
      const getCurrentUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUserId(data.user.id);
        }
      };
      
      getCurrentUser();
    }, []);

  const {
    data,
    isLoading,
    isError
  } = useGetLocationReview(id,timeMode);
  
  // Get the user's review for this location
  const {
    data: userReviewData,
    isLoading: isUserReviewLoading,
    isError: isUserReviewError,
    error: userReviewError
  } = useGetReviewByUser(id,timeMode);

  const deleteReviewMutation = useDeleteReview(id,timeMode);

  
  const hasUserReview = !!userReviewData?.review;

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
    overall: data?.avg_general,
    women: data?.avg_women_safety,
    transit: data?.avg_transit,
    neighbourhood: data?.avg_neighbourhood,
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
        style={{ color: "#000000" }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  );
};


  if(isLoading){
    return (
      <Card className="w-full text-black bg-white border border-white/10 min-h-[20rem]">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pb-6">
          <div className="space-y-3 sm:space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2 sm:space-y-3">
                <Skeleton className="h-6 w-3/4 sm:w-1/2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-2 flex-1 rounded-full mr-4" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }



  return (
    <>
    <Card
      className="w-full text-black bg-white border border-white/10 min-h-[20rem] transition-colors duration-200 hover:shadow-lg"
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <CardTitle className="text-lg sm:text-xl font-bold" style={{ color: "#000000" }}>
            Reviews ({data?.review_count})
          </CardTitle>
          
          {/* Day/Night Toggle */}
          <Button 
            onClick={toggleDayNightMode} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 border bg-[#F8F4EF] border-white/20 text-black w-fit"
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
        
        {userId && <div className="flex gap-2 w-full sm:w-auto justify-end">
          {hasUserReview && (
            <Button
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setIsPopupOpen(true)}
            className="flex items-center gap-2 text-white"
            style={{
              backgroundColor: "#3B82F6",
            }}
          >
            {hasUserReview ? (
              <>
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span> Review
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span> Review
              </>
            )}
          </Button>
        </div>}
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 pb-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2 sm:space-y-3">
            <span className="text-base sm:text-xl font-medium" style={{ color: "#000000" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Overall Safety Score
            </span>
            {!ratings.overall && <p className="text-black text-sm sm:text-base">No reviews</p>}
            {ratings.overall && <BarRating rating={Number(ratings.overall)} />}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <span className="text-base sm:text-xl font-medium" style={{ color: "#000000" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Women Safety Score
            </span>
            {!ratings.women && <p className="text-black text-sm sm:text-base">No reviews</p>}
            {ratings.women!==null && ratings.women!==undefined && <BarRating rating={Number(ratings.women)} isWomenScore={true} />}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <span className="text-sm sm:text-base font-medium" style={{ color: "#000000" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Transit Safety Score
            </span>
            {!ratings.transit && <p className="text-black text-sm sm:text-base">No reviews</p>}
            {ratings.transit!==null && ratings.transit!==undefined && <BarRating rating={Number(ratings.transit)} />}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <span className="text-sm sm:text-base font-medium" style={{ color: "#000000" }}>
              {timeMode === "DAY" ? "Daytime" : "Nighttime"} Neighbourhood Safety Score 
            </span>
            {!ratings.neighbourhood && <p className="text-black text-sm sm:text-base">No reviews</p>}
            {ratings.neighbourhood!==null && ratings.neighbourhood!==undefined && <BarRating rating={Number(ratings.neighbourhood)} />}
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
     />

     {/* Delete Confirmation Dialog */}
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 text-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 font-semibold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will permanently delete your review. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReview}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )

}
