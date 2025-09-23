import { AreaCard } from "./components/area-card";
import { PrecautionCard } from "./components/map-card";
import { ReviewsCard } from "./components/reviews-card";
import TabView from "./components/TabView";
import { Metadata} from "next";
import { db } from "@/lib/prisma";

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

const page = () => {
  
  return (
    <div className="min-h-screen bg-white  p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Area Card - Full Width */}
        <AreaCard  />
        

        {/* Middle Row - Map and Reviews Cards */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReviewsCard  />
          <PrecautionCard  />
        </div> */}
        <ReviewsCard/>
        <PrecautionCard/>


        {/* Tabbed Interface for Comments and Posts */}
        <TabView />
      </div>
    </div>
  );
};

export default page;