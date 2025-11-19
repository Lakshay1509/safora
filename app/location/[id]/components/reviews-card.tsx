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
import { useGetLocation } from "@/features/location/use-get-location";
import Image from "next/image";

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

  //review1
  const {data:review1,isLoading:review1_loading} = useGetLocation(id)


  const {
    data,
    isLoading,
    isError
  } = useGetLocationReview(id, timeMode);


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

  const StarRating = ({ rating, label, isOverall = false }: { rating: number; label: string; isOverall?: boolean }) => {
    const filledStars = Math.floor(rating);
    const partialStar = rating % 1 > 0;

    return (
      <div className={`flex items-center justify-between ${isOverall ? 'py-4 border-b border-gray-200' : 'py-2'}`}>
        <span 
          className={`font-medium ${isOverall ? 'text-lg' : 'text-sm'} text-gray-700`}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`${isOverall ? 'w-6 h-6' : 'w-4 h-4'} ${
                  i < filledStars ? 'text-yellow-400' : (i === filledStars && partialStar ? 'text-yellow-400' : 'text-gray-300')
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z" />
                </svg>
              </div>
            ))}
          </div>
          <span className={`${isOverall ? 'text-lg' : 'text-sm'} font-semibold text-gray-900 min-w-[2.5rem] text-right`}>
            {rating?.toFixed(1) || "N/A"}
          </span>
        </div>
      </div>
    );
  };

  if (isLoading || review1_loading) {
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
        className="w-full text-black bg-white border border-white/10 transition-colors duration-200 min-h-75"
      >
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">

            <CardTitle className="text-lg sm:text-xl font-bold" style={{ color: "#000000" }}>
              Reviews ({((data?.review_count ?? 0) + Number(review1?.location?.reviews1 ?? 0))})
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
                  
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                 
                </>
              )}
            </Button>
          </div>}
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 ">
          <div>

            {/* Display all ratings in a grid layout */}
            {(!ratings.overall && !ratings.women && !ratings.transit && !ratings.neighbourhood) ? (
              <p className="text-gray-600 text-sm sm:text-base font-medium italic text-center py-8">
                Be the first to share your experience!
              </p>

            ) : (
              <div className="flex flex-col space-y-1">
                <StarRating
                  rating={Number(ratings.overall) || 0}
                  label="Overall Safety"
                  isOverall={true}
                />
                <div className="pt-2 space-y-1">
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
  )
}