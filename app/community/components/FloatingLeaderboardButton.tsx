"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

export default function FloatingLeaderboardButton() {
  return (
    <Link
      href="/leaderboard"
      className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50 
                 bg-gradient-to-r from-yellow-400 to-yellow-600 
                 hover:from-yellow-500 hover:to-yellow-700
                 text-white rounded-full p-3 shadow-lg 
                 transition-all duration-300 hover:scale-110
                 flex items-center justify-center group"
      aria-label="View Leaderboard"
    >
      <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
    </Link>
  );
}
