"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useGetDefaultUser } from "@/features/user/use-get-default"
import { useGetUserComments } from "@/features/user/use-get-user-comment";
import { MapPin, Calendar, Star } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useGetUserLocationCount } from "@/features/user/use-get-locationCount";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SelectGender from "@/components/SelectGender";

export function ProfileCard() {

  const {data:UserData,isLoading,isError} =useGetDefaultUser();
  const {data:UserComment} =  useGetUserComments();
  const {data:UserLocationCount} =  useGetUserLocationCount();
  const [dialogOpen,setIsDialogOpen]= useState<boolean>(false);  

  // Format the date if it exists
  const formatCreatedDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMMM d, yyyy")
    } catch (error) {
      return dateString // Fallback to original string if parsing fails
    }
  }

  return (
    <Card className="rounded-xl border shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
      <CardContent className="p-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
              {UserData?.userData.name}
            </h2>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="mt-6 space-y-1">
          <p className="text-center text-sm">Member Since</p>
          <div className="flex items-center justify-center space-x-3">
            <Calendar className="w-4 h-4" style={{ color: "#2563EB" }} />
            <span style={{ color: "#4B5563" }}>
               {UserData?.userData.created_at ? formatCreatedDate(UserData.userData.created_at) : ""}
            </span>
          </div>
        </div>


        {/* Profile Stats Numbers */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold" style={{ color: "#111827" }}>
              {UserComment?.comments.length}
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              Comments
            </div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: "#111827" }}>
              {UserLocationCount?.count}
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              Places Visited
            </div>
          </div>
        </div>
        {!isLoading && !isError && UserData?.userData.gender===null && (<div className="flex justify-center items-center mt-10">
        <Button onClick={() => {
          setIsDialogOpen(true)
        }}>
          Add Gender
        </Button>

        <SelectGender 
          DialogOpen={dialogOpen} 
          onClose={() => setIsDialogOpen(false)}
        />
        </div>)}
      </CardContent>
    </Card>
  )
}
