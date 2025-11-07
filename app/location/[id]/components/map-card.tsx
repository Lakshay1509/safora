//@ts-nocheck
"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationPrecautions } from "@/features/location/use-get-location-precaution";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { GeneratedWarnings, TravelerWarning } from "@/lib/gemini-service";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const cleanPrecautionTip = (tip: string): string => {

  // Remove citation brackets like [1], [2, 3] from anywhere in the string
  // Handles cases like: "Text[1].", "Text.[1]", "Text[1, 2].", "Text.[1, 2]"
  return tip
    .replace(/\[[\d\s,]+\]\./g, '.') // Remove citations before periods: [1]. -> .
    .replace(/\.\[[\d\s,]+\]/g, '.') // Remove citations after periods: .[1] -> .
    .replace(/\s*\[[\d\s,]+\]\s*/g, ' ') // Remove remaining citations and normalize spaces
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim(); // Remove leading/trailing whitespace
};

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'tourist_scam':
      return '🎯';
    case 'tourist_crime':
      return '🚨';
    case 'women_traveler_safety':
      return '👩';
    case 'traveler_environment':
      return '🌍';
    case 'tourist_transport':
      return '🚕';
    case 'accommodation_scam':
      return '🏨';
    default:
      return '⚠️';
  }
};

const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function PrecautionCard() {
  const [loadingMessage, setLoadingMessage] = useState("Let me gather info...");



  const params = useParams();
  const id = params.id as string

  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data,
    isLoading,
    isError
  } = useGetLocationPrecautions(id);

  // Extract warnings from the new structure
  const warnings: TravelerWarning[] = data?.warnings?.warnings ?? [];
  const dataRecency = data?.warnings?.dataRecency;
  const travelerRelevance = data?.warnings?.travelerRelevance;

  useEffect(() => {
    if (!isLoading) return;

    
  const messages = [
  "Tobi's on it...",
  "Fetching travel data...",
  "Analyzing safety info...",
  "Checking recent reports...",
  "Almost ready...",
  "Packing your insights...",
  "All set for your journey!",

];


    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, [isLoading]);



  return (
    <Card
      className="w-full bg-white border border-white/10 transition-colors duration-200 "
    >
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {/* Bear mascot in header - always visible */}
              {!isLoading && <Image
                src='/bear.png'
                width={40}
                height={40}
                alt="Tobi mascot"
                className="flex-shrink-0"
              />}
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                  <p className="font-medium">Tobi's Safety Brief</p>
                  <p className="text-[12px] bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                    (AI Generated - Last 30 Days)
                  </p>
                </div>

                {data?.created_at && (
                  <p className="text-[10px] mt-2 text-gray-500">
                    Updated {formatDistanceToNow(new Date(data?.created_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>

            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="flex-1 overflow-auto ">
          {isLoading ? (
            <div className="w-full text-black bg-white min-h-[14rem]">

              <CardContent className="space-y-4 sm:space-y-6 pb-6">
                {/* Centered bear mascot with loading message */}
                <div className="flex flex-col items-center justify-center py-8">
                  <Image
                    src='/bear_think.png'
                    width={70}
                    height={70}
                    alt="Loading bear mascot"
                  />
                  <p className="text-sm text-gray-600 animate-pulse mt-4">
                    {loadingMessage}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    This may take up to 30-40 seconds
                  </p>
                </div>


              </CardContent>
            </div>

          )

            : isError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertTriangle className="w-8 h-8 text-black mb-2" />
                <p className="text-black">Failed to load safety information</p>
              </div>
            )
              : warnings.length === 0 ? (
                <div className="text-center py-6" style={{ color: "#000000" }}>
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="font-semibold text-lg">All clear! 🌞</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {dataRecency === 'no_recent_data'
                      ? 'No incidents reported recently — travelers have been safe here!'
                      : 'Everything looks great! No safety concerns reported for this location.'}
                  </p>
                </div>

              )
                : (
                  <div className="space-y-4">
                    <ul className="space-y-4 pr-2">
                      {warnings.map((warning, index) => (
                        <li key={index} className="bg-[#F8F4EF] p-4 rounded-lg border border-white/10 transition-all hover:shadow-md">
                          <div className="flex items-start gap-3">
                            {/* <span className="text-2xl flex-shrink-0">{getCategoryIcon(warning.category)}</span> */}

                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2 flex-wrap">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${getSeverityColor(warning.severity)}`}
                                    >
                                      {warning.severity.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-gray-600">
                                      {formatCategory(warning.category)}
                                    </span>
                                  </div>

                                  <p className="font-semibold text-sm md:text-base text-black">
                                    {cleanPrecautionTip(warning.issue)}
                                  </p>
                                </div>
                              </div>

                              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                {cleanPrecautionTip(warning.details)}
                              </p>

                              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                                <span className="italic">
                                  Affects: {warning.travelerImpact}
                                </span>
                                {/* <span>
                                  Last reported: {new Date(warning.lastReported).toLocaleDateString()}
                                </span> */}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
        </CardContent>
        
      )}

    </Card>
    
  )
}