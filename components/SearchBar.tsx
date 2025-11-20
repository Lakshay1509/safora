"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";


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

interface SearchBarProps {
  onLocationSelect: (location: LocationResult) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function SearchBar({ onLocationSelect, isMobile = false, onClose }: SearchBarProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/geocode/search?text=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();
      
      if (data.features && Array.isArray(data.features)) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSuggestionClick = (feature: any) => {
    if (feature?.properties) {
      const locationData: LocationResult = {
        formatted: feature.properties.formatted || "",
        lat: feature.geometry?.type === "Point" ? feature.geometry.coordinates[1] : 0,
        lon: feature.geometry?.type === "Point" ? feature.geometry.coordinates[0] : 0,
        place_id: feature.properties.place_id || "",
        address_line1: feature.properties.address_line1,
        address_line2: feature.properties.address_line2,
        city: feature.properties.city,
        country: feature.properties.country,
      };

      onLocationSelect(locationData);
      setSearchText("");
      setSuggestions([]);
      setShowSuggestions(false);
      
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
        
        <input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          placeholder="Search locations..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
        />

        {searchText && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((feature, index) => (
                <li key={feature.properties?.place_id || index}>
                  <button
                    onClick={() => handleSuggestionClick(feature)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {feature.properties?.address_line1}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {feature.properties?.address_line2}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}