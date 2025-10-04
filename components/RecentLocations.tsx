"use client";

import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

interface LocationHistory {
  id: string;
  name: string;
  visitedAt: string;
}

export function RecentLocations() {
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Read cookie client-side
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('location_history='))
        ?.split('=')[1];

      if (cookieValue) {
        const decoded = decodeURIComponent(cookieValue);
        const parsedHistory = JSON.parse(decoded);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Error reading location history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white  border-t border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recently Viewed</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white  border-t border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Recently Viewed</h3>
      </div>
      
      <div className="">
        {history.slice(0, 3).map((location) => (
          <Link
            key={location.id}
            href={`/location/${location.id}`}
            className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {location.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(location.visitedAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}