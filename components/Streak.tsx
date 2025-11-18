"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeStreak } from "@/hooks/useStreak";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";

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
        <Link href="/achievments" className="flex items-center justify-center space-x-1 bg-white border border-gray-200 shadow-sm rounded-full px-2 py-1 hover:bg-gray-50 transition-colors cursor-pointer">
            {streak?.active_today &&<Image
                src="/flame.gif"
                alt="streak"
                height={17}
                width={17}
                className="object-contain"
                unoptimized
            />}
            {!streak?.active_today && <Image
                src="/no-flame.png"
                alt="streak"
                height={17}
                width={17}
                className="object-contain"
            />

            }
            <p className="text-[16px]  font-semibold text-gray-800">{streak?.count ?? 0}</p>
        </Link>

    );
}
