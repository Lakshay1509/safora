"use client";

import { useUpdateUserPreference } from "@/features/user/use-update-email-pref";
import { useEffect, useState } from "react";

export default function EmailSettings() {
    const [digest, setDigest] = useState<"daily" | "off">("off");

    const mutation = useUpdateUserPreference();

    useEffect(() => {
        const value = digest === "daily" ? 1 : 0;
        mutation.mutate({
            daily_digest: value,
        });
    }, [digest]);

    return (
        <div className="min-h-screen bg-white p-6 max-w-4xl mx-auto">


            {/* Title */}
            <h1 className="text-2xl font-bold mb-2">Email settings</h1>
            <p className="text-gray-600 mb-6">
                Manage your email settings on Safe or Not. Pick what types of email you want
                to receive and their frequency.
            </p>

            {/* Emails from Medium */}
            <h2 className="text-lg font-semibold mb-2">Emails from Safe or Not</h2>

            {/* Medium Digest */}
            <div className="mb-6">
                <h3 className="font-medium">Safe or Not Digest</h3>
                <p className="text-sm text-gray-600 mb-3">
                    The best stories on Safe or Not personalized based on your interests, as
                    well as outstanding stories selected by our editors
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => setDigest("daily")}
                        disabled={mutation.isPending}
                        className={`px-4 py-1 rounded-full border transition-colors
    ${digest === "daily"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white text-gray-700 border-gray-300"}
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200`}
                    >
                        Daily
                    </button>

                    <button
                        onClick={() => setDigest("off")}
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
