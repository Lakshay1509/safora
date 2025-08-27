"use client"

import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginButton from "./LoginLogoutButton"
import { useEffect, useRef, useState } from "react"
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete"
import type { GeoJSON } from "geojson"
import { useRouter } from "next/navigation";

// Import the CSS styles for the autocomplete
import "@geoapify/geocoder-autocomplete/styles/minimal.css"
import { useGetLocationByCoord } from "@/features/location/use-get-location-coord"
import { addLocationByCoord } from "@/features/location/use-add-location-coord"
import { useAuth } from "@/contexts/AuthContext"

interface LocationResult {
  formatted: string
  lat: number
  lon: number
  place_id: string
  address_line1: string
  address_line2: string
  city?: string
  country: string
}

interface LocationFormatted {
  lat: number 
  long: number
  city: string | null
  country: string
  name:string
}

export function Navbar() {
  
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lon: number} | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<LocationFormatted>()
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const geocoderRef = useRef<GeocoderAutocomplete | null>(null)
  const router = useRouter();
  const LocationMutation = addLocationByCoord();

  const {user, loading} = useAuth();

  // Get location data when coordinates change
  const {data, isError, isSuccess, refetch} = useGetLocationByCoord(
    selectedCoords?.lon || 0,
    selectedCoords?.lat || 0,
    
  )

  useEffect(() => {
    if (isSuccess && data?.location?.length) {
      router.push(`/location/${data.location[0].id}`);
     
      setSelectedLocation(undefined);
      setSelectedCoords(null);
    } else if (isError && selectedLocation) {
      const postLocation = async () => {
       
        const locationToCreate = { ...selectedLocation };
        setSelectedLocation(undefined);

        try {
          const result:any = await LocationMutation.mutateAsync(locationToCreate);
          if (result?.location?.length) {
             // After successful creation, navigate to the new page
            router.push(`/location/${result.location[0].id}`);
            setSelectedCoords(null); // Clear coords as well
          }
        } catch (e) {
          console.error("Failed to create location:", e);
          
        }
      };

      postLocation();
    }
  }, [isSuccess, data, isError, selectedLocation, LocationMutation, router]);



  // Replace with your actual Geoapify API key
  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "YOUR_API_KEY_HERE"

  useEffect(() => {
    if (autocompleteRef.current && !geocoderRef.current) {
      // Initialize Geoapify Geocoder Autocomplete
      geocoderRef.current = new GeocoderAutocomplete(
        autocompleteRef.current,
        GEOAPIFY_API_KEY,
        {
          placeholder: "Search locations...",
          debounceDelay: 300, // 300ms debounce delay
          limit: 3, // Limit suggestions to 5
          skipIcons: false, // Show location icons
          lang: "en", // Language
          // Filter options - you can customize these
          // filter: {
          //   countrycode: ['us', 'gb', 'ca'] // Limit to specific countries
          // },
          // bias: {
          //   proximity: { lat: 40.7128, lon: -74.0060 } // Bias towards NYC
          // }
        }
      )

      // Handle location selection
      geocoderRef.current.on('select', (location: GeoJSON.Feature) => {
        if (location?.properties) {
          const locationData: LocationResult = {
            formatted: location.properties.formatted || '',
            lat: location.geometry?.type === 'Point' ? location.geometry.coordinates[1] : 0,
            lon: location.geometry?.type === 'Point' ? location.geometry.coordinates[0] : 0,
            place_id: location.properties.place_id || '',
            address_line1: location.properties.address_line1,
            address_line2: location.properties.address_line2,
            city: location.properties.city,
            country: location.properties.country
          }
          
          handleLocationSelect(locationData)
        }
      })

      // Handle suggestions changes (optional)
      geocoderRef.current.on('suggestions', (suggestions: GeoJSON.Feature[]) => {
        // You can process suggestions here if needed
        console.log('Suggestions:', suggestions)
      })

      // Handle input changes
      
    }

    return () => {
      // Cleanup
      if (geocoderRef.current) {
        geocoderRef.current.off('select')
        geocoderRef.current.off('suggestions')
        geocoderRef.current.off('input')
        geocoderRef.current.off('open')
        geocoderRef.current.off('close')
      }
    }
  }, [GEOAPIFY_API_KEY])

  const handleLocationSelect = (location: LocationResult) => {
    console.log('Selected location:', location)
   
    
    // Update the coordinates state instead of directly calling the hook
    setSelectedCoords({
      lat: location.lat,
      lon: location.lon
    })
    setSelectedLocation({
      lat:location.lat,
      long:location.lon,
      city:location?.city?  location.city : null,
      country:location.country,
      name:location.address_line1
    })
    
    // Here you can:
    // 1. Update global state with selected location
    // 2. Navigate to location details page
    // 3. Update map view
    // 4. Store in localStorage
    // 5. Make API calls with coordinates
    
    // Example: Update URL or navigate
    // router.push(`/location/${location.place_id}`)
    
    // Example: Update parent component or global state
    // onLocationSelect?.(location)
  }

 

  return (
    <div className="my-4 mx-10">
    <nav className="max-w-8xl rounded-full shadow-sm" style={{ backgroundColor: "#F9FAFB" }}>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-black" >
              SafeSpot
            </h1>
          </div>

          {/* Search Bar with Geoapify Autocomplete */}
          <div className={`flex-1 max-w-md mx-8 ${user?.id && !loading ? "block":"hidden"}`}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 text-black"
                
              />
              
              {/* Geoapify Autocomplete Container */}
              <div 
                ref={autocompleteRef} 
                className={`relative w-full geoapify-autocomplete-container ml-10 bg-white text-black ${user?.id && !loading ? "block":"hidden"}`}
              >
                {/* The autocomplete will inject its input here */}
              </div>
            </div>
          </div>

          {/* Profile and Logout */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className={`p-2 hover:bg-gray-200 ${user?.id && !loading ? "block":"hidden"}`} onClick={()=>{router.push('/profile')}} >
              <User className="w-5 h-5 text-black" />
            </Button>
            <LoginButton/>
          </div>
        </div>
      </div>
    </nav>
    </div>
  )
}