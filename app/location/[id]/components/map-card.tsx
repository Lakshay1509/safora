//@ts-nocheck
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationPrecautions } from "@/features/location/use-get-location-precaution";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { GeneratedWarnings, TravelerWarning } from "@/lib/gemini-service";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
            <div>
              <p className="font-medium">
                Traveler Safety Warnings{" "}
                <span className="text-[14px] bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  (AI Generated - Last 30 Days)
                </span>
              </p>

              
              
              {/* {dataRecency && (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {dataRecency === 'last_7_days' ? '✓ Recent Data' : 
                   dataRecency === 'outdated' ? '⚠ Outdated' : 
                   '⚠ Limited Data'}
                </Badge>
              )} */}
              {data?.created_at && <p className="text-[10px] mt-2">Updated {formatDistanceToNow(new Date(data?.created_at), { addSuffix: true })}</p>}
            </div>
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="flex-1 overflow-auto ">

          {isLoading ? (<Card className="w-full text-black bg-white border border-white/10 min-h-[20rem]">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                <Skeleton className="h-4 w-32 bg-gradient-to-r from-[#f292ed] to-[#e1dae6]" />
                <Skeleton className="h-4 w-24 bg-gradient-to-r from-[#f292ed] to-[#e1dae6]" />
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Skeleton className="h-9 w-28 bg-gradient-to-r from-[#f292ed] to-[#e1dae6]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 pb-6">
              <div className="space-y-3 sm:space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-2 sm:space-y-3">
                    <Skeleton className="h-6 w-3/4 sm:w-1/2 bg-gradient-to-r from-[#f292ed] to-[#e1dae6]" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-2 flex-1 rounded-full mr-4 bg-gradient-to-r from-[#f292ed] to-[#e1dae6]" />
                      <Skeleton className="h-7 w-12 bg-gradient-to-r from-[#f292ed] to-[#e1dae6]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>)
            : isError ? (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertTriangle className="w-8 h-8 text-black mb-2" />
                <p className="text-black">Failed to load safety information</p>
              </div>
            )
              : warnings.length === 0 ? (
                <div className="text-center py-6" style={{ color: "#000000" }}>
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">No recent traveler safety warnings</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {dataRecency === 'no_recent_data' 
                      ? 'No traveler-specific incidents reported in the last 7 days'
                      : 'No safety warnings available for this location'}
                  </p>
                </div>
              )
                : (
                  <div className="space-y-4">
                    {travelerRelevance && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 pb-2 border-b">
                        <span>Relevance:</span>
                        <Badge variant={travelerRelevance === 'high' ? 'default' : 'secondary'}>
                          {travelerRelevance.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    
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