"use client"


import { AreaCard } from "./components/area-card";
import { PrecautionCard } from "./components/map-card";
import { ReviewsCard } from "./components/reviews-card";
import { CommentsCard } from "./components/comments-card";

const page = () => {
  
    
  return (
    <div className="min-h-screen bg-white  p-4 md:p-6 lg:p-8">
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Area Card - Full Width */}
        <AreaCard />

        {/* Middle Row - Map and Reviews Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReviewsCard />
          <PrecautionCard />
        </div>

        {/* Bottom Comments Card - Full Width */}
        <CommentsCard />
      </div>
    </div>
  )
}

export default page