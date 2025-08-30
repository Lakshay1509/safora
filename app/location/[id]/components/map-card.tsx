//@ts-nocheck
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationPrecautions } from "@/features/location/use-get-location-precaution";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2  } from "lucide-react";
import { GeneratedPrecautions,SafetyTip} from "@/lib/gemini-service";
import { formatDistanceToNow } from "date-fns";

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
  
  const {
    data,
    isLoading,
    isError
  } = useGetLocationPrecautions(id);

  

  // Ensure tips is always an array with the correct type
  const safetyTips: SafetyTip[] = data?.approved_precautions?.tips ?? [];

  
   

  return (
    <Card
      className="w-full bg-white border border-white/10 h-110 transition-colors duration-200 hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          <div>
          <p>Precautions & Safety Concerns <span className="text-[12px] text text-black">(AI Generated)</span></p>
          <p className="text-[12px] text-right">Updated {formatDistanceToNow(new Date(data?.created_at),{ addSuffix: true })}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto ">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-black" />
            <p className="ml-2 text-black">Loading safety tips...</p>
          </div>
        )}
        
        {isError && (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="w-8 h-8 text-black mb-2" />
            <p className="text-black">Failed to load safety information</p>
          </div>
        )}
        
        {!isLoading && !isError && safetyTips.length === 0 && (
          <div className="text-center" style={{ color: "#000000" }}>
            No safety precautions available for this location
          </div>
        )}
        
        {!isLoading && !isError && safetyTips.length > 0 && (
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
    </Card>
  )
}