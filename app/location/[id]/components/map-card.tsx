"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetLocationPrecautions } from "@/features/location/use-get-location-precaution";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2  } from "lucide-react";

// Define the expected precaution type
interface Precaution {
  tip: string;
  // Add other properties if needed
}

// Helper function to clean precaution tips
const cleanPrecautionTip = (tip: string): string => {
  // Find the first period and trim any content after it that resembles an array reference
  const match = tip.match(/^(.*?\.)\s*\[\d+(?:,\s*\d+)*\]?/);
  return match ? match[1] : tip;
};

export function PrecautionCard() {
  const params = useParams();
  const id = params.id as string
  
  const {
    data,
    isLoading,
    isError
  } = useGetLocationPrecautions(id);

  // Ensure precautions is always an array with the correct type
  const precautions: Precaution[] = Array.isArray(data?.locationPrecautions?.approved_precautions) 
    ? data.locationPrecautions.approved_precautions 
    : [];

  return (
    <Card
      className="w-full bg-white border border-white/10 h-80 lg:h-110 transition-colors duration-200 hover:shadow-lg"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold" style={{ color: "#000000" }}>
          <span></span>Precautions and Safety Concerns <span className="text-sm text text-black">(AI Generated)</span>
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
        
        {!isLoading && !isError && precautions.length === 0 && (
          <div className="text-center" style={{ color: "#000000" }}>
            No safety precautions available for this location
          </div>
        )}
        
        {!isLoading && !isError && precautions.length > 0 && (
          <ul className="space-y-3 pr-2">
            {precautions.map((item, index) => (
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
