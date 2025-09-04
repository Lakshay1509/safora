"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationReview } from "@/features/location/use-get-location-review";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, Sun, Moon } from "lucide-react"
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
import { useGetReview1 } from "@/features/reviews/use-get-review1";

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
  } = useGetLocationReview(id, timeMode);

  const {
    data: Review1,

  } = useGetReview1(id);

  // Get the user's review for this location
  const {
    data: userReviewData,
    isLoading: isUserReviewLoading,
    isError: isUserReviewError,
    error: userReviewError
  } = useGetReviewByUser(id, timeMode);

  const deleteReviewMutation = useDeleteReview(id, timeMode);


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

  const StarRating = ({ rating, label }: { rating: number; label: string }) => {
    const filledStars = Math.floor(rating);
    const partialStar = rating % 1 > 0;
    
    return (
      <div className="flex flex-col items-center">
        <span className="text-sm font-medium mb-1" style={{ color: "#000000" }}>
          {label}
        </span>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={`w-5 h-5 ${i < filledStars ? 'text-yellow-400' : (i === filledStars && partialStar ? 'text-yellow-400' : 'text-gray-300')}`} 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-2 text-sm font-semibold text-black">{rating?.toFixed(1) || "N/A"}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
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
          <div className="mb-4">
            <Skeleton className="h-6 w-3/4 sm:w-1/2 mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card
        className="w-full text-black bg-white border border-white/10 transition-colors duration-200"
      >
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">

            <CardTitle className="text-lg sm:text-xl font-bold" style={{ color: "#000000" }}>
              Reviews ({(data?.review_count || 0) + Number(Review1?.review?.review || 0)})
            </CardTitle>


            {/* Day/Night Toggle */}
            <Button
              onClick={toggleDayNightMode}
              variant="outline"
              size="sm"
              className="flex items-center justify-end gap-2 border bg-[#F8F4EF] border-white/20 text-black w-fit"
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
        <CardContent className="space-y-4 sm:space-y-6 ">
          <div>
            
            {/* Display all ratings in a grid layout */}
            {(!ratings.overall && !ratings.women && !ratings.transit && !ratings.neighbourhood) ? (
              <p className="text-black text-sm sm:text-base">No reviews yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StarRating 
                  rating={Number(ratings.overall) || 0} 
                  label="Overall Safety"
                />
                <StarRating 
                  rating={Number(ratings.women) || 0} 
                  label="Women Safety"
                />
                <StarRating 
                  rating={Number(ratings.transit) || 0} 
                  label="Transit Safety"
                />
                <StarRating 
                  rating={Number(ratings.neighbourhood) || 0} 
                  label="Neighbourhood"
                />
              </div>
            )}
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
  )}