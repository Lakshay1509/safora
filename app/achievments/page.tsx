"use client";

import { Button } from "@/components/ui/button";
import RightSidebar from "../community/components/RightSidebar";
import Image from "next/image";
import { useGetAchievment } from "@/features/achievment/use-get-achivement";
import { Check } from "lucide-react";
import UnlockButton from "./UnlockButton";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDefaultUser } from "@/features/user/use-get-default";

const criteria = {
  rookie: {
    locationReview: 3,
    posts: 1,
    upvotesReceived: 10,
    streak: 3,
    articles: 0,
    color: "#38bdf8", // slate-400
  },
  scout: {
    locationReview: 10,
    posts: 5,
    upvotesReceived: 25,
    streak: 7,
    articles: 1,
    color: "#22c55e", // green-500
  },
  nomad: {
    locationReview: 25,
    posts: 15,
    upvotesReceived: 50,
    streak: 21,
    articles: 3,
    color: "#3b82f6", // blue-500
  },
  voyager: {
    locationReview: 50,
    posts: 30,
    upvotesReceived: 75,
    streak: 42,
    articles: 5,
    color: "#a855f7", // purple-500
  },
  legend: {
    locationReview: 75,
    posts: 50,
    upvotesReceived: 100,
    streak: 70,
    articles: 10,
    color: "#eab308", // yellow-500
  },
  champion: {
    locationReview: 100,
    posts: 50,
    upvotesReceived: 150,
    streak: 100,
    articles: 20,
    color: "#ef4444", // red-500
  },
};

const Page = () => {
  const entries = Object.entries(criteria);
  const {data:user} = useGetDefaultUser();
  const {data,isLoading,isError} = useGetAchievment();

  if(!data || !user){
    return null;
  }

  return (
    <section className="max-w-[30rem] mx-auto lg:ml-10 p-6 relative">
      {entries.map(([level, stats], index) => (
        <div key={level} className="relative flex flex-col sm:flex-row items-start gap-6 mb-12">
          {/* Connecting Line */}


          {/* Left: Colored Ring with Tier Name */}
          <div className="sm:w-1/4 flex-col justify-center items-center relative z-10">
            <div className="flex flex-col items-center gap-3">
              {/* Colored Ring */}
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center relative"
                style={{
                  border: `4px solid ${stats.color}`,
                  boxShadow: `0 0 20px ${stats.color}40`
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${stats.color}20, ${stats.color}10)`
                  }}
                />
              </div>
              
              {/* Colored Tier Name */}
              <h2 
                className="text-lg font-bold capitalize tracking-wide text-center"
                style={{ color: stats.color }}
              >
                {user.userData.name}
              </h2>
            </div>
            
            <UnlockButton enabled={data?.uniqueLocationReviews >= stats.locationReview && data?.postCount >= stats.posts &&  data?.totalUpvotes >= stats.upvotesReceived && data?.streakCount >= stats.streak && data?.articlesCount >= stats.articles }/>
          </div>


          {/* Right: Tasks */}
          <div className="w-full sm:w-3/4 relative z-10">
            <div className="px-5 space-y-3">
              <h1 className="text-xl font-bold text-black mb-6 border-b-2 border-red-500 inline-block pb-1 capitalize">
                {level}
              </h1>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Post {stats.locationReview} location reviews
               <Check className={`${data?.uniqueLocationReviews >= stats.locationReview ? 'h-4 w-4' : 'hidden'}`} />

              </p>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Make {stats.posts} post{stats.posts > 1 && "s"}
                <Check className={`${data?.postCount >= stats.posts ? 'h-4 w-4' : 'hidden'}`} />
              </p>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Receive {stats.upvotesReceived} upvotes
                <Check className={`${data?.totalUpvotes >= stats.upvotesReceived ? 'h-4 w-4' : 'hidden'}`} />
              </p>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Maintain a streak of {stats.streak} days
                <Check className={`${data?.streakCount >= stats.streak? 'h-4 w-4' : 'hidden'}`} />
              </p>

              <p className={`text-black font-medium flex items-center gap-2 text-sm ${stats.articles!==0 ? 'block':'hidden'}`}>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Write {stats.articles} article{stats.articles > 1 && "s"}
                <Check className={`${data?.articlesCount >= stats.articles ? 'h-4 w-4' : 'hidden'}`} />
              </p>

            </div>

          </div>

        </div>
      ))}
      <aside className="hidden lg:block w-80 flex-shrink-0 p-4">
        <div className="sticky top-4">
          <RightSidebar />
        </div>
      </aside>
    </section>
  );
};

export default Page;
