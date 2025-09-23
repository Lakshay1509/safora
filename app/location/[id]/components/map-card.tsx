//@ts-nocheck
"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationPrecautions } from "@/features/location/use-get-location-precaution";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { GeneratedPrecautions, SafetyTip } from "@/lib/gemini-service";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

export function PrecautionCard() {
  const params = useParams();
  const id = params.id as string

  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data,
    isLoading,
    isError
  } = useGetLocationPrecautions(id);



  // Ensure tips is always an array with the correct type
  const safetyTips: SafetyTip[] = data?.approved_precautions?.tips ?? [];


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
                Precautions & Safety Concerns{" "}
                <span className="text-[14px] bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent">
                  (AI Generated)
                </span>
              </p>

              {data?.created_at && <p className="text-[12px]">Updated {formatDistanceToNow(new Date(data?.created_at), { addSuffix: true })}</p>}
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
              : safetyTips.length === 0 ? (
                <div className="text-center" style={{ color: "#000000" }}>
                  No safety precautions available for this location
                </div>
              )
                : (
                  <ul className="space-y-3 pr-2 text-sm md:text-base">
                    {safetyTips.map((item, index) => (
                      <li key={index} className="bg-[#F8F4EF] p-3 rounded-md border border-white/10 transition-all">
                        <p style={{ color: "#000000" }}>
                          {cleanPrecautionTip(item.tip)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
        </CardContent>
      )}
    </Card>
  )
}