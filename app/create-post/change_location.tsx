"use client"

import { useState, useEffect, useRef } from "react";
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import type { GeoJSON } from "geojson";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { useGetLocationByCoord } from "@/features/location/use-get-location-coord";
import { addLocationByCoord } from "@/features/location/use-add-location-coord";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface LocationResult {
  formatted: string;
  lat: number;
  lon: number;
  place_id: string;
  address_line1: string;
  address_line2: string;
  city?: string;
  country: string;
}

interface LocationFormatted {
  lat: number;
  long: number;
  city: string | null;
  country: string;
  name: string;
}

interface ChangeLocationProps {
  onLocationSelect: (locationId: string) => void;
  currentLocationName?: string | null;
}

const ChangeLocation = ({ onLocationSelect, currentLocationName }: ChangeLocationProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationFormatted>();
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<GeocoderAutocomplete | null>(null);

  const LocationMutation = addLocationByCoord();

  const { data, isError, isSuccess, isLoading } = useGetLocationByCoord(
    selectedCoords?.lon || 0,
    selectedCoords?.lat || 0
  );

  const showLoading = isLoading || loadingLocation;

  useEffect(() => {
    if (isSuccess && data?.location?.length) {
      onLocationSelect(data.location[0].id);
      setLoadingLocation(false);
      setIsSearching(false);
      setSelectedCoords(null);
      setSelectedLocation(undefined);
    } else if (isError && selectedLocation) {
      const postLocation = async () => {
        setLoadingLocation(true);
        const locationToCreate = { ...selectedLocation };
        setSelectedLocation(undefined);

        try {
          const result: any = await LocationMutation.mutateAsync(locationToCreate);
          if (result?.location?.length) {
            onLocationSelect(result.location[0].id);
          }
        } catch (e) {
          console.error("Failed to create location:", e);
        } finally {
          setLoadingLocation(false);
          setIsSearching(false);
          setSelectedCoords(null);
        }
      };
      postLocation();
    }
  }, [isSuccess, data, isError, selectedLocation, LocationMutation, onLocationSelect]);

  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "YOUR_API_KEY_HERE";

  useEffect(() => {
    if (isSearching && autocompleteRef.current && !geocoderRef.current) {
      geocoderRef.current = new GeocoderAutocomplete(
        autocompleteRef.current,
        GEOAPIFY_API_KEY,
        {
          placeholder: "Search for a location...",
          debounceDelay: 300,
          limit: 3,
          skipIcons: false,
          lang: "en",
        }
      );

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
            country: location.properties.country,
          };
          handleLocationSelect(locationData);
        }
      });
    }

    return () => {
      if (geocoderRef.current) {
        geocoderRef.current.off('select');
        geocoderRef.current = null;
      }
    };
  }, [isSearching, GEOAPIFY_API_KEY]);

  const handleLocationSelect = (location: LocationResult) => {
    setLoadingLocation(true);
    setSelectedCoords({ lat: location.lat, lon: location.lon });
    setSelectedLocation({
      lat: location.lat,
      long: location.lon,
      city: location?.city ? location.city : null,
      country: location.country,
      name: location.address_line1,
    });
  };

  const handleCancelSearch = () => {
    // Properly clean up the autocomplete component
    if (geocoderRef.current) {
      geocoderRef.current.off('select');
      geocoderRef.current = null;
    }
    
    // Clear the autocomplete container content
    if (autocompleteRef.current) {
      autocompleteRef.current.innerHTML = '';
    }
    
    setIsSearching(false);
  };

  if (showLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="ml-2">Finding location...</span>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 text-gray-500" />
        <div ref={autocompleteRef} className="geoapify-autocomplete-container ml-8"></div>
        <Button variant="default" size="sm" onClick={handleCancelSearch} className="absolute right-10 top-1/2 transform -translate-y-1/2 ml-10">Cancel</Button>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-10 text-sm">
      {currentLocationName ? (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-800 dark:text-blue-200">
          <p className="font-medium">Posting in: {currentLocationName}</p>
        </div>
      ) : (
        <p>Please select a location to post.</p>
      )}
      <div>
        <Button onClick={() => setIsSearching(true)}>
          {currentLocationName ? 'Change Location' : 'Select Location'}
        </Button>
      </div>
    </div>
  );
};

export default ChangeLocation;