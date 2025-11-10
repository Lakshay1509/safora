import { AreaCard } from "./components/area-card";
import { PrecautionCard } from "./components/map-card";
import { ReviewsCard } from "./components/reviews-card";
import TabView from "./components/TabView";
import { Metadata } from "next";
import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LocationTracker } from "./components/LocationTracker";
import NotFound from "@/app/not-found";
import MetricsCard from "./components/metrics";

type Props = {
  params: Promise<{ id: string }>;
};

// ✅ Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const location = await db.locations.findUnique({
    where: { id: id },
    select: { name: true },
  });

  if (!location) {
    return { title: "Location not found | Safe or Not" };
  }

  return {
    title: `Is ${location.name} Safe? Real Safety Reviews & Ratings 2025`,
    description: `Is ${location.name} safe or not? Get real traveler safety reviews, crime ratings, and safety tips for ${location.name}. Community-driven insights from travelers who've been there.`,
    openGraph: {
      title: `Is ${location.name} Safe? Community Safety Reviews`,
      description: `Wondering if ${location.name} is safe to visit? Read authentic safety reviews, crime statistics, and travel warnings from real travelers.`,
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
      title: `Is ${location.name} Safe? Travel Safety Guide 2025`,
      description: `Get real answers about ${location.name} safety. Read community reviews, safety ratings, and tips from travelers.`,
      images: ["/og.webp"],
    },
    alternates:{
      canonical: `/location/${id}`
    }
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

  if (!location) {
    return (
      <div>
        <NotFound />
      </div>
    )
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Is ${location.name} safe?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Based on community reviews and real traveler experiences, ${location.name} has safety ratings across multiple categories. Check detailed safety reviews, crime statistics, and travel tips from verified travelers on Safe or Not.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${location.name} safe for tourists?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Tourist safety in ${location.name} varies by area and time. Read authentic reviews from travelers covering tourist scams, pickpocketing risks, and safe areas to visit in ${location.name}.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${location.name} safe for women travelers?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Women's safety ratings for ${location.name} are based on real female traveler experiences. Check specific safety scores, harassment reports, and tips from solo female travelers.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${location.name} safe at night?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Night safety in ${location.name} depends on the neighborhood. Read community reviews about safe and unsafe areas after dark, public transit safety, and late-night precautions.`
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white px-4 pb-20 md:px-6 lg:px-8">
      {/* Hidden semantic content for SEO */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Enhanced semantic content for SEO */}
      <article className="sr-only" aria-hidden="true">
        <h1>Is {location.name} Safe? Safety Reviews & Ratings</h1>
        <h2>Is {location.name} safe to visit?</h2>
        <p>
          Wondering if {location.name} is safe or not? Get authentic safety insights from real travelers.
          Explore safety reviews, crime ratings, and community experiences about {location.name}.
          Safe or Not provides AI-powered safety scores based on verified user reports.
        </p>
        <h2>Safety Ratings for {location.name}</h2>
        <p>
          Check overall safety, women's safety, night safety, and neighborhood ratings for {location.name}.
          Real-time updates and traveler-reported incidents help you make informed decisions.
        </p>
        <h2>Is {location.name} safe for tourists?</h2>
        <p>
          Tourist safety in {location.name} includes scam warnings, pickpocketing risks, and safe areas.
          Read reviews from travelers who recently visited {location.name}.
        </p>
      </article>


      {/* Add LocationTracker here - it renders nothing but tracks the visit */}
      {location && (
        <LocationTracker locationId={id} locationName={location.name} />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Area Card - Full Width */}
        <AreaCard />
        <ReviewsCard />
        <MetricsCard/>

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
                Create an account to access detailed safety insights (like walkability, lighting quality score, public transport score etc), community discussions, and contribute your own experiences.
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