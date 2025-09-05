"use client"

import { Search, User, Menu, X, Users } from "lucide-react"
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
import Link from "next/link"
import Image from "next/image"

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
  name: string
}

export function Navbar() {
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lon: number } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<LocationFormatted>()
  const autocompleteDesktopRef = useRef<HTMLDivElement>(null)
  const autocompleteMobileRef = useRef<HTMLDivElement>(null)
  const geocoderDesktopRef = useRef<GeocoderAutocomplete | null>(null)
  const geocoderMobileRef = useRef<GeocoderAutocomplete | null>(null)
  const router = useRouter();
  const LocationMutation = addLocationByCoord();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const { user, loading } = useAuth();

  // Get location data when coordinates change
  const { data, isError, isSuccess, isLoading } = useGetLocationByCoord(
    selectedCoords?.lon || 0,
    selectedCoords?.lat || 0,

  )

  const showLoading = isLoading || loadingLocation;

  useEffect(() => {
  if (isSuccess && data?.location?.length) {
    
    router.push(`/location/${data.location[0].id}`);
    setSelectedLocation(undefined);
    setSelectedCoords(null);
    setLoadingLocation(false); 
  } else if (isError && selectedLocation) {
    const postLocation = async () => {
      setLoadingLocation(true); 
      
      const locationToCreate = { ...selectedLocation };
      setSelectedLocation(undefined);

      try {
        const result: any = await LocationMutation.mutateAsync(locationToCreate);
        if (result?.location?.length) {
          router.push(`/location/${result.location[0].id}`);
          setSelectedCoords(null);
        }
      } catch (e) {
        console.error("Failed to create location:", e);
      } finally {
        setLoadingLocation(false); // Stop loading in all cases
      }
    };

    postLocation();
  }
}, [isSuccess, data, isError, selectedLocation, LocationMutation, router]);





  
  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "YOUR_API_KEY_HERE"

  useEffect(() => {
    // Initialize desktop geocoder
    if (autocompleteDesktopRef.current && !geocoderDesktopRef.current) {
      geocoderDesktopRef.current = new GeocoderAutocomplete(
        autocompleteDesktopRef.current,
        GEOAPIFY_API_KEY,
        {
          placeholder: "Search locations...",
          debounceDelay: 300,
          limit: 3,
          skipIcons: false,
          lang: "en",
        }
      )

      // Handle location selection for desktop
      geocoderDesktopRef.current.on('select', (location: GeoJSON.Feature) => {
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
    }

    return () => {
      // Cleanup desktop
      if (geocoderDesktopRef.current) {
        geocoderDesktopRef.current.off('select')
        geocoderDesktopRef.current.off('suggestions')
        geocoderDesktopRef.current.off('input')
        geocoderDesktopRef.current.off('open')
        geocoderDesktopRef.current.off('close')
      }
    }
  }, [GEOAPIFY_API_KEY])

  // Separate effect for mobile geocoder to prevent conflicts
  useEffect(() => {
    // Initialize mobile geocoder when search bar is open
    if (searchBarOpen && autocompleteMobileRef.current && !geocoderMobileRef.current) {
      geocoderMobileRef.current = new GeocoderAutocomplete(
        autocompleteMobileRef.current,
        GEOAPIFY_API_KEY,
        {
          placeholder: "Search locations...",
          debounceDelay: 300,
          limit: 3,
          skipIcons: false,
          lang: "en",
        }
      )

      // Handle location selection for mobile
      geocoderMobileRef.current.on('select', (location: GeoJSON.Feature) => {
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
          // Close search dialog after selection
          setSearchBarOpen(false)
        }
      })
    }

    // Clean up mobile geocoder when search bar closes
    return () => {
      if (!searchBarOpen && geocoderMobileRef.current) {
        geocoderMobileRef.current.off('select')
        geocoderMobileRef.current.off('suggestions')
        geocoderMobileRef.current.off('input')
        geocoderMobileRef.current.off('open')
        geocoderMobileRef.current.off('close')
        geocoderMobileRef.current = null
      }
    }
  }, [searchBarOpen, GEOAPIFY_API_KEY])

  const handleLocationSelect = (location: LocationResult) => {
    console.log('Selected location:', location)
    setLoadingLocation(true);

    // Update the coordinates state instead of directly calling the hook
    setSelectedCoords({
      lat: location.lat,
      lon: location.lon
    })
    setSelectedLocation({
      lat: location.lat,
      long: location.lon,
      city: location?.city ? location.city : null,
      country: location.country,
      name: location.address_line1
    })
  }



  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close search bar when menu is opened
    if (!mobileMenuOpen) {
      setSearchBarOpen(false);
    }
  };

  // Toggle search bar
  const toggleSearchBar = () => {
    setSearchBarOpen(!searchBarOpen);
    // Close mobile menu when search bar is opened
    if (!searchBarOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <nav className={`bg-[#F9FAFB] rounded-xl shadow-sm border-b transition-all duration-200 ${showLoading ? 'border-b-4 border-blue-500' : ''
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-2 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                {/* <h1 className="text-xl font-bold text-black">
                  Safe or Not
                </h1> */}
                <Image
                  src="/logo.png"
                  alt="Safe or Not"
                  width={150}
                  height={50}
                />
              </Link>
            </div>

            {/* Search Bar - visible on larger screens */}
            <div className="hidden flex-1 max-w-md mx-8 md:flex">
              <div className="relative w-full">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 text-black"
                />

                {/* Geoapify Autocomplete Container for Desktop */}
                <div
                  ref={autocompleteDesktopRef}
                  className="relative w-full geoapify-autocomplete-container ml-10 bg-white text-black"
                >
                  {/* The autocomplete will inject its input here */}
                </div>
              </div>
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="sm" className="p-2 mr-2" onClick={toggleSearchBar}>
                <Search className="w-5 h-5 text-black" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
              </Button>
            </div>

            {/* Profile and Logout - visible on larger screens */}
            <div className="hidden md:flex justify-center items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className={`p-2 hover:bg-gray-200 ${user?.id && !loading ? "block" : "hidden"}`}
                onClick={() => { router.push('/profile') }}
              >
                <User className="w-5 h-5 text-black" />
              </Button>
              <Link
  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 hover:underline transition-all duration-200 group"
  href="/community"
>
  <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
  <span className="group-hover:translate-x-1 transition-transform duration-200">
    Community
  </span>
</Link>
              <LoginButton />
            </div>
          </div>

          {/* Mobile Search Dialog - appears when search icon is clicked */}
          {searchBarOpen && (
            <div className="md:hidden px-2 pb-4 pt-2 transition-all duration-300 ease-in-out">
              <div className="bg-white rounded-lg shadow-md p-3">
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={() => setSearchBarOpen(false)}
                  >
                  </Button>
                  
                </div>

                {/* Geoapify Autocomplete Container for Mobile */}
                <div
                  ref={autocompleteMobileRef}
                  className="relative w-full geoapify-autocomplete-container bg-white text-black"
                >
                  {/* The autocomplete will inject its input here */}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu - slides down when hamburger is clicked */}
          {mobileMenuOpen && (
            <div className="md:hidden px-2 pb-4 pt-1 transition-all duration-300 ease-in-out">
              <div className="flex flex-col space-y-3">
                <Link
  className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 hover:underline transition-all duration-200 group"
  href="/community"
>
  <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
  <span className="group-hover:translate-x-1 transition-transform duration-200">
    Community
  </span>
</Link>
                {user?.id && !loading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start p-2 hover:bg-gray-200"
                    onClick={() => {
                      router.push('/profile');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-5 h-5 text-black mr-2" />
                    <span className="text-black">Profile</span>
                  </Button>
                )}
                <div className="py-1">
                  <LoginButton />
                </div>
                
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}