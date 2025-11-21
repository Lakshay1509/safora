"use client"

import { Search, User, Menu, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import LoginButton from "./LoginLogoutButton"
import { useEffect, useRef, useState } from "react"
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete"
import { useRouter, usePathname } from "next/navigation";
import "@geoapify/geocoder-autocomplete/styles/minimal.css"
import { useGetLocationByCoord } from "@/features/location/use-get-location-coord"
import { addLocationByCoord } from "@/features/location/use-add-location-coord"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import Image from "next/image"
import { NotificationBell } from "./NotificationBell"
import StreakCounter from "./Streak"


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
  const pathname = usePathname();
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
          setLoadingLocation(false);
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      setSearchBarOpen(false);
    }
  };

  const toggleSearchBar = () => {
    setSearchBarOpen(!searchBarOpen);
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
            <div className="flex-shrink-0 mt-2">
              <Link href="/">
                <Image
                  src="/logo.avif"
                  alt="Safe or Not"
                  width={180}
                  height={50}
                  fetchPriority="high"
                  className="hidden md:block"
                />
              </Link>
              <Link href="/">
                <Image
                  src="/logo.avif"
                  alt="Safe or Not"
                  width={120}
                  height={50}
                  fetchPriority="high"
                  className="block md:hidden"
                />
              </Link>
            </div>

            
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
            <div className="flex items-center md:hidden gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSearchBar}
                className="bg-white border border-gray-200 shadow-sm rounded-full p-2 hover:bg-gray-50 transition-all"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </Button>

              {user && <NotificationBell />}
              {user && <StreakCounter />}
              <Button variant="ghost" size="sm" className="p-2" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
              </Button>
            </div>

            {/* Profile and Logout - visible on larger screens */}
            <div className="hidden md:flex justify-center items-center space-x-3">
              <Link
                className={`flex items-center gap-2 text-sm  py-2 px-3 rounded-2xl  transition-all duration-200 group ${pathname === "/community" ? "bg-black text-white font-semibold" : "text-gray-700"
                  }`}
                href="/community"
              >
                <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  Community
                </span>
              </Link>

              {user?.id && !loading && (
                <>
                  <NotificationBell />
                  <StreakCounter />
                </>
              )}
              <LoginButton />
            </div>
          </div>

          {/* Mobile Search Dialog */}
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-2 pb-4 pt-1 transition-all duration-300 ease-in-out">
              <div className="flex flex-col space-y-3">
                <Link
                  className={`flex items-center gap-2 text-sm hover:underline py-2 px-3 rounded-2xl  transition-all duration-200 group ${pathname === "/community" ? "bg-black text-white font-semibold" : "text-gray-700"
                    }`}
                  href="/community"
                >
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Community
                  </span>
                </Link>
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