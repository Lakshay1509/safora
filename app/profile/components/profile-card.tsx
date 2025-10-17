"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useGetDefaultUser } from "@/features/user/use-get-default"
import { useGetUserComments } from "@/features/user/use-get-user-comment";
import { MapPin, Calendar, Star, Settings } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useGetUserLocationCount } from "@/features/user/use-get-locationCount";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SelectGender from "@/components/SelectGender";
import AvatarUpload from "./AvatarUpload";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SelectGenderProfile from "@/components/SelectGenderProfile";


export function ProfileCard() {
  const {user,loading} = useAuth()
  const router = useRouter();
  const [currentAvatar, setCurrentAvatar] = useState<string>('');

  useEffect(() => {
          if (!loading && !user) {
              router.push('/login');
          }
      }, [user, loading, router]);

  const handleUploadSuccess = (newAvatarUrl: string) => {
    setCurrentAvatar(newAvatarUrl);
    // console.log('Avatar uploaded successfully:', newAvatarUrl);
    // You can also update your global state, show a toast notification, etc.
  };

  const handleUploadError = (error: string) => {
    console.error('Avatar upload failed:', error);
    // Show error toast or notification
  };


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

  useEffect(()=>{

    setCurrentAvatar(UserData?.userData?.profile_url ? UserData.userData.profile_url : '');


  },[UserData])


  return (
    <Card className="rounded-xl border min-h-120 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
      <CardContent className="p-6 pt-0">
        {/* Profile Header */}
        <div className="w-full  flex justify-end">
          <button className="p-2 rounded-full hover:bg-gray-300 hover:cursor-pointer" onClick={()=>{router.push('/profile/settings')}}><Settings/></button></div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: "#111827" }}>
              {UserData?.userData.name}
            </h2>
          </div>
        </div>

         <AvatarUpload
        currentAvatarUrl={currentAvatar}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        maxSizeInMB={3}
        className="mb-6"
      />

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
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
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
          <div>
            <div className="text-lg font-bold" style={{ color: "#111827" }}>
              {UserComment?.following_count?.following_locations_count}
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>
              Following
            </div>
          </div>
        </div>
        {!isLoading && !isError && UserData?.userData.gender===null && (<div className="flex justify-center items-center mt-10">
        <Button onClick={() => {
          setIsDialogOpen(true)
        }}>
          Add Gender
        </Button>

        <SelectGenderProfile
          DialogOpen={dialogOpen} 
          onClose={() => setIsDialogOpen(false)}
        />
        </div>)}
      </CardContent>
    </Card>
  )
}
