"use client";

import { useEffect } from "react";
import { addLocationToHistory,trackLocationView } from "@/lib/location-history";

interface LocationTrackerProps {
  locationId: string;
  locationName: string;
}

export function LocationTracker({ locationId, locationName }: LocationTrackerProps) {
  useEffect(() => {
    // Track the visit when component mounts
    addLocationToHistory(locationId, locationName);
    trackLocationView(locationId)
    
  }, [locationId, locationName]);

  // This component doesn't render anything
  return null;
}``