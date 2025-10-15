"use client";

import { Button } from "@/components/ui/button";
import RightSidebar from "../community/components/RightSidebar";
import Image from "next/image";
import { useGetAchievment } from "@/features/achievment/use-get-achivement";
import { Check, FileText, MapPin } from "lucide-react";
import UnlockButton from "./UnlockButton";
import { useAuth } from "@/contexts/AuthContext";
import { useGetDefaultUser } from "@/features/user/use-get-default";
import ProfileLogo from "@/components/ProfileLogo";
import StreakCounter from "@/components/Streak";

const criteria = {
  rookie: {
    locationReview: 3,
    posts: 1,
    upvotesReceived: 10,
    streak: 3,
    articles: 0,
    color: "#38bdf8",
    extra: undefined,
  },
  scout: {
    locationReview: 10,
    posts: 5,
    upvotesReceived: 25,
    streak: 7,
    articles: 1,
    color: "#22c55e",
    extra: undefined,
  },
  nomad: {
    locationReview: 25,
    posts: 15,
    upvotesReceived: 50,
    streak: 21,
    articles: 3,
    color: "#3b82f6",
    extra: undefined,
  },
  voyager: {
    locationReview: 50,
    posts: 30,
    upvotesReceived: 75,
    streak: 42,
    articles: 5,
    color: "#a855f7",
    extra: undefined,
  },
  legend: {
    locationReview: 75,
    posts: 50,
    upvotesReceived: 100,
    streak: 70,
    articles: 10,
    color: "#eab308",
    extra: undefined,
  },
  champion: {
    locationReview: 100,
    posts: 50,
    upvotesReceived: 150,
    streak: 100,
    articles: 20,
    color: "#ef4444",
    extra: '$20 worth of gift, you deserve it'
  },
};

const Page = () => {
  const entries = Object.entries(criteria);
  const { data: user } = useGetDefaultUser();
  const { data, isLoading, isError } = useGetAchievment();

  if (!data || !user) {
    return null;
  }

  return (
    <section className="max-w-4xl mx-auto lg:ml-10 p-6 relative pb-20">
      <h1 className="font-bold mb-10 text-2xl">Achievements</h1>
      <div className="mb-10 w-full flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          <ProfileLogo
            url={user.userData.profile_url}
            name={user.userData.name}
            size="80"
            color={user.userData.profile_color ?? ''}
          />
          <div className="text-2xl font-bold" style={{
            color: user?.userData.profile_color || '#000000'
          }}>{user.userData.name}</div>
        </div>

        <div className="flex gap-2 items-center mt-3">
          <p className="text-gray-600 font-medium">Current Streak</p>
          <StreakCounter />
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600 mt-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 " />
            <p>{data?.uniqueLocationReviews} Reviews</p>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 " />
            <p>{data?.postCount} Posts</p>
          </div>
        </div>
      </div>


      {/* Grid Layout: 1 column on mobile, 2 columns on medium screens, 3 columns on large screens */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
        {entries.map(([level, stats], index) => (
          <div
            key={level}
            className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
          >
            {/* Badge and Title Section */}
            <div className="flex flex-col items-center mb-6">
              {/* Tier Name */}
              <h2
                className="text-2xl font-bold capitalize tracking-wide text-center mb-3"
                style={{ color: stats.color }}
              >
                {level}
              </h2>
              {stats.extra && <p className="mt-2 text-sm"> + {stats.extra} !</p>}
            </div>

            {/* Tasks Section */}
            <div className="flex-1 space-y-3 mb-6">
              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="flex-1">Post {stats.locationReview} location reviews</span>
                <Check
                  className={`${data?.uniqueLocationReviews >= stats.locationReview
                    ? "h-4 w-4 text-green-600 flex-shrink-0"
                    : "hidden"
                    }`}
                />
              </p>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="flex-1">
                  Make {stats.posts} post{stats.posts > 1 && "s"}
                </span>
                <Check
                  className={`${data?.postCount >= stats.posts
                    ? "h-4 w-4 text-green-600 flex-shrink-0"
                    : "hidden"
                    }`}
                />
              </p>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="flex-1">Receive {stats.upvotesReceived} upvotes</span>
                <Check
                  className={`${data?.totalUpvotes >= stats.upvotesReceived
                    ? "h-4 w-4 text-green-600 flex-shrink-0"
                    : "hidden"
                    }`}
                />
              </p>

              <p className="text-black font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="flex-1">Maintain a streak of {stats.streak} days</span>
                <Check
                  className={`${data?.streakCount >= stats.streak
                    ? "h-4 w-4 text-green-600 flex-shrink-0"
                    : "hidden"
                    }`}
                />
              </p>

              <p
                className={`text-black font-medium flex items-center gap-2 text-sm ${stats.articles !== 0 ? "block" : "hidden"
                  }`}
              >
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="flex-1">
                  Write {stats.articles} article{stats.articles > 1 && "s"}
                </span>
                <Check
                  className={`${data?.articlesCount >= stats.articles
                    ? "h-4 w-4 text-green-600 flex-shrink-0"
                    : "hidden"
                    }`}
                />
              </p>
            </div>

            {/* Unlock Button */}
            <UnlockButton
              enabled={
                data?.uniqueLocationReviews >= stats.locationReview &&
                data?.postCount >= stats.posts &&
                data?.totalUpvotes >= stats.upvotesReceived &&
                data?.streakCount >= stats.streak &&
                data?.articlesCount >= stats.articles
              }
              id={index + 1}
              streak={stats.streak}
              articlesCount={stats.articles}
              postCount={stats.posts}
              upvotesData={stats.upvotesReceived}
              uniqueLocationReviews={stats.locationReview}
            />
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0 p-4">
        <div className="sticky top-4">
          <RightSidebar />
        </div>
      </aside>
    </section>
  );
};

export default Page;
