"use client"

import { Search, User, LogOut, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LoginButton from "./LoginLogoutButton"
import { useEffect, useRef, useState } from "react"
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete"
import type { GeoJSON, Position } from "geojson"

// Import the CSS styles for the autocomplete
import "@geoapify/geocoder-autocomplete/styles/minimal-dark.css"

interface LocationResult {
  formatted: string
  lat: Position|number
  lon: Position|number
  place_id: string
  address_line1?: string
  address_line2?: string
  city?: string
  country?: string
}

export function Navbar() {
  const [searchValue, setSearchValue] = useState("")
  const [showClearButton, setShowClearButton] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const geocoderRef = useRef<GeocoderAutocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
          debounceDelay: 900, // 300ms debounce delay
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
            lon: location.geometry?.type === 'Point' ? location.geometry.coordinates : 0,
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
      geocoderRef.current.on('input', (inputValue: string) => {
        setSearchValue(inputValue)
        setShowClearButton(inputValue.length > 0)
      })
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
    setSearchValue(location.formatted)
    setShowClearButton(true)
    
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

  const handleClearSearch = () => {
    if (geocoderRef.current) {
      geocoderRef.current.setValue("")
    }
    setSearchValue("")
    setShowClearButton(false)
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (geocoderRef.current) {
      geocoderRef.current.setValue(value)
    }
    setSearchValue(value)
    setShowClearButton(value.length > 0)
  }

  return (
    <nav className="w-full border-b" style={{ backgroundColor: "#2C2C2C", borderColor: "#2A2A2A" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold" style={{ color: "#EAEAEA" }}>
              SafeSpot
            </h1>
          </div>

          {/* Search Bar with Geoapify Autocomplete */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10"
                style={{ color: "#9CA3AF" }}
              />
              
              {/* Geoapify Autocomplete Container */}
              <div 
                ref={autocompleteRef} 
                className="relative w-full geoapify-autocomplete-container ml-10"
              >
                {/* The autocomplete will inject its input here */}
              </div>
            </div>
          </div>

          {/* Profile and Logout */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800" style={{ color: "#9CA3AF" }}>
              <User className="w-5 h-5" />
            </Button>
            <LoginButton/>
          </div>
        </div>
      </div>
    </nav>
  )
}
