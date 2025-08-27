"use client"
import { useEffect, useState } from "react";
import WorldMap from "@/components/ui/world-map";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDefaultUser } from "@/features/user/use-get-default";
import SelectGender from "./SelectGender";


export default function LandingPage() {

    
  
    const router = useRouter();
    const {user} = useAuth();

    const {data,isLoading,isError} = useGetDefaultUser();
    
  return (
    <div className="min-h-screen w-full py-10 sm:py-16 md:py-20 dark:bg-black bg-white flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl dark:text-white text-black">
          Your Everyday Safety Lens
        </p>
        <p className="text-sm sm:text-base md:text-lg text-neutral-500 max-w-xs sm:max-w-md md:max-w-2xl mx-auto py-2 sm:py-3 md:py-4">
         Subtle safety insights — quick, simple, and reassuring.
        </p>
        
        <div className="mt-4 sm:mt-5 md:mt-6">
          {!user ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg shadow-sm hover:shadow-md transition-colors duration-200 text-sm sm:text-base"
              size="lg"
              onClick={()=>{router.push('/login')}}
            >
              Login to Get Started
            </Button>

          ) : (
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 rounded-lg shadow-sm hover:shadow-md transition-colors duration-200 text-sm sm:text-base"
              size="lg"
            >
              Search Locations
            </Button>

          )}
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto mt-4 sm:mt-6 md:mt-8 px-2 sm:px-4">
        <div className="aspect-[16/9] sm:aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/6]">
          <WorldMap
            dots={[
              {
                start: {
                  lat: 64.2008,
                  lng: -149.4937,
                }, // Alaska (Fairbanks)
                end: {
                  lat: 34.0522,
                  lng: -118.2437,
                }, // Los Angeles
              },
              {
                start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
              },
              {
                start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
              },
              {
                start: { lat: 51.5074, lng: -0.1278 }, // London
                end: { lat: 28.6139, lng: 77.209 }, // New Delhi
              },
              {
                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
              },
              {
                start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
              },
            ]}
          />
        </div>
      </div>

      <SelectGender DialogOpen={!isLoading && !isError && data?.userData.gender===null}/>
    </div>
  );
}
