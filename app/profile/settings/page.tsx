"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDefaultUser } from "@/features/user/use-get-default";
import { useUpdateUserPreference } from "@/features/user/use-update-email-pref";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmailSettings() {
    const router = useRouter();
    const {user,loading} = useAuth();
    const [digest, setDigest] = useState<"daily" | "off">("off");
    const { data, isLoading, isError } = useGetDefaultUser();
    const mutation = useUpdateUserPreference();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Initialize from server data
    useEffect(() => {
        if (data?.userData && !isLoading) {
            const serverValue = data.userData.daily_digest === 1 ? "daily" : "off";
            setDigest(serverValue);
        }
    }, [data?.userData.daily_digest, isLoading]);

    // Handle user changes (separate from server sync)
    const handleDigestChange = (newDigest: "daily" | "off") => {
        setDigest(newDigest);
        const value = newDigest === "daily" ? 1 : 0;

        mutation.mutate({
            daily_digest: value,
        });
    };


    if(isLoading){
        return(
            <div className="flex justify-center min-h-screen">
      <div className="w-full max-w-4xl space-y-6 p-6">
        {/* Title */}
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80" />

        {/* Section */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-150" />
          <Skeleton className="h-4 w-150" />

          {/* Buttons */}
          <div className="flex gap-4">
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
        )
    }

    return (
        <div className="min-h-screen bg-white p-6 max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-2xl font-bold mb-2">Email settings</h1>
            <p className="text-gray-600 mb-6">
                Manage your email settings on Safe or Not. Pick what types of email you want
                to receive and their frequency.
            </p>


            {/* Medium Digest */}
            <div className="mb-6">
                <h3 className="font-medium">Safe or Not Digest</h3>
                <p className="text-sm text-gray-600 mb-3">
                    The weekly stories on Safe or Not personalized based on your interests, as
                    well as outstanding stories selected by our editors
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleDigestChange("daily")}  // ✅ Now calls API
                        disabled={mutation.isPending}
                        className={`px-4 py-1 rounded-full border transition-colors
                            ${digest === "daily"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white text-gray-700 border-gray-300"}
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200`}
                    >
                        Weekly
                    </button>

                    <button
                        onClick={() => handleDigestChange("off")}    // ✅ Now calls API
                        disabled={mutation.isPending}
                        className={`px-4 py-1 rounded-full border transition-colors
                            ${digest === "off"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white text-gray-700 border-gray-300"}
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200`}
                    >
                        Off
                    </button>
                </div>
            </div>
        </div>
    );
}
