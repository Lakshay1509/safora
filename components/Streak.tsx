"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeStreak } from "@/hooks/useStreak";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

export default function StreakCounter() {
    const { user, loading: authLoading } = useAuth();
    const { streak, loading, error } = useRealtimeStreak({
        userId: user?.id,
        enabled: !!user, // Only fetch when user exists
    });

   
   if (loading)
  return (
    <div className="flex items-center space-x-2 bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1 w-fit">
      <Skeleton className="h-4 w-4 rounded-full" />  {/* Icon placeholder */}
      <Skeleton className="h-4 w-6 rounded-md" />   {/* Number placeholder */}
    </div>
  )

    

    return (
        <div className="flex items-center space-x-1 bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1">
            <Image
                src="/flame.gif"
                alt="streak"
                height={17}
                width={17}
                className="object-contain"
            />
            <p className="text-[16px] mt-1 font-semibold text-gray-800">{streak?.count ?? 0}</p>
        </div>

    );
}
