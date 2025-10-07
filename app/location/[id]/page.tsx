import { AreaCard } from "./components/area-card";
import { PrecautionCard } from "./components/map-card";
import { ReviewsCard } from "./components/reviews-card";
import TabView from "./components/TabView";
import { Metadata} from "next";
import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LocationTracker } from "./components/LocationTracker";

type Props = {
  params: Promise<{ id: string }>;
};

// ✅ Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const {id} = await params;
  const location = await db.locations.findUnique({
    where: { id: id },
    select: { name: true },
  });

  if (!location) {
    return { title: "Location not found | Safe or Not" };
  }

  return {
    title: `${location.name} `,
    description: `Discover safety insights, reviews, and precautions for ${location.name}. Community-driven safety ratings powered by AI.`,
    openGraph: {
      title: `${location.name} | Safe or Not`,
      description: `Check safety reviews and insights for ${location.name}.`,
      url: `https://www.safeornot.space/location/${id}`,
      siteName: "Safe or Not",
      images: [
        {
          url: "/og.webp",
          width: 1200,
          height: 630,
          alt: `${location.name} - Safe or Not`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} | Safe or Not`,
      description: `Community insights & safety tips for ${location.name}.`,
      images: ["/og.webp"],
    },
  };
}

const page = async ({ params }: Props) => {
  const { id } = await params;
  
  // Check if user is authenticated (server-side)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get location details for tracking
  const location = await db.locations.findUnique({
    where: { id: id },
    select: { name: true },
  });

  return (
    <div className="min-h-screen bg-white p-4 pb-20 md:p-6 lg:p-8">
      {/* Add LocationTracker here - it renders nothing but tracks the visit */}
      {location && (
        <LocationTracker locationId={id} locationName={location.name} />
      )}
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Area Card - Full Width */}
        <AreaCard />
        <ReviewsCard />

        {/* Show TabView only if user is logged in */}
        {user ? (
          <>
          
        <PrecautionCard />
          <TabView />
          </>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Sign in to unlock more
              </h3>
              <p className="text-gray-600">
                Create an account to access detailed safety insights, community discussions, and contribute your own experiences.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;