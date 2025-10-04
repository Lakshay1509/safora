"use client";

import { useEffect } from "react";
import { addLocationToHistory } from "@/lib/location-history";

interface LocationTrackerProps {
  locationId: string;
  locationName: string;
}

export function LocationTracker({ locationId, locationName }: LocationTrackerProps) {
  useEffect(() => {
    // Track the visit when component mounts
    addLocationToHistory(locationId, locationName);
  }, [locationId, locationName]);

  // This component doesn't render anything
  return null;
}``