import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { generateLocationMetrics, generateTravelerWarnings } from "@/lib/gemini-service";
import { trackAnonymousPrecautionView } from "@/lib/location-history";
enum TimeOfDay {
  DAY = "DAY",
  NIGHT = "NIGHT",
}

interface location {
  name: string;
  id: string;
  created_at: Date;
  country: string;
  city: string | null;
  lat: number;
  lon: number;
}

const app = new Hono()

  .get("/locationsByCoord", async (ctx) => {
    const supabase = await createClient();
    // const {
    //   data: { user },
    //   error,
    // } = await supabase.auth.getUser();

    // if (error || !user) {
    //   return ctx.json({ error: "Unauthorized" }, 401);
    //}
    const latParam = ctx.req.query("lat");
    const lonParam = ctx.req.query("lon");

    if (!latParam || !lonParam) {
      return ctx.json({ error: "Latitude and longitude are required" }, 400);
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);

    if (isNaN(lat) || isNaN(lon)) {
      return ctx.json({ error: "Invalid latitude or longitude format" }, 400);
    }

    // Use ST_DWithin for coordinate matching with a very small tolerance
    const location = await db.$queryRaw<location[]>`
      SELECT id, country, city, name, created_at, 
             ST_AsText(geog) as geog_text
      FROM locations 
      WHERE ST_DWithin(geog, ST_Point(${lon}, ${lat}, 4326)::geography, 0.1)
      LIMIT 1
  `;

    if (!location || (Array.isArray(location) && location.length === 0)) {
      return ctx.json({ error: "Location not found" }, 404);
    }

    return ctx.json({ location }, 200);
  })

  .get("/locationByID/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // if (error || !user) {
    //   return ctx.json({ error: "Unauthorized" }, 401);
    // }

    const location = await db.locations.findUnique({
      where: { id: id },
    });

    if (!location) {
      return ctx.json({ error: "Location not found" }, 404);
    }

    const posts = await db.posts.count({
      where: { location_id: id },
    });

    const comments = await db.comments.count({
      where: { location_id: id },
    });

    const followers = await db.locations.findUnique({
      where: { id: id },
      select: {
        followers_count: true,
      },
    });

    // Check if user is following this location
    let isFollowing = false;
    if (user) {
      const followRecord = await db.user_location_follows.findUnique({
        where: {
          user_id_location_id: {
            user_id: user.id,
            location_id: id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    return ctx.json({ location, posts, comments, followers, isFollowing }, 200);
  })

  .get("/reviews/:id/:time_of_day", async (ctx) => {
    const id = ctx.req.param("id");
    const time_of_day_param = ctx.req.param("time_of_day");
    const time_of_day = time_of_day_param as TimeOfDay;

    const supabase = await createClient();
    // const {
    //   data: { user },
    //   error,
    // } = await supabase.auth.getUser();

    // if (error || !user) {
    //   return ctx.json({ error: "Unauthorized" }, 401);
    // }

    // Query reviews table directly
    const { data: reviewData } = await supabase
      .from("reviews")
      .select(
        "general_score, women_safety_score, transit_score, neighbourhood_score"
      )
      .eq("location_id", id)
      .eq("time_of_day", time_of_day);

    if (!reviewData || reviewData.length === 0) {
      return ctx.json(
        {
          review_count: 0,
          avg_general: null,
          avg_women_safety: null,
          avg_transit: null,
          avg_neighbourhood: null,
        },
        200
      );
    }

    const review_count = reviewData.length;

    // Helper function to calculate average excluding null values
    const calculateAverage = (values: (number | null)[]): number | null => {
      const validValues = values.filter((v): v is number => v !== null);
      if (validValues.length === 0) return null;
      return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
    };

    const avg_general =
      reviewData.reduce((sum, r) => sum + r.general_score, 0) / review_count;

    const women_safety_scores = reviewData.map((r) => r.women_safety_score);
    const transit_scores = reviewData.map((r) => r.transit_score);
    const neighbourhood_scores = reviewData.map((r) => r.neighbourhood_score);

    const avg_women_safety = calculateAverage(women_safety_scores);
    const avg_transit = calculateAverage(transit_scores);
    const avg_neighbourhood = calculateAverage(neighbourhood_scores);

    return ctx.json(
      {
        review_count,
        avg_general: Math.round(avg_general * 100) / 100,
        avg_women_safety: avg_women_safety
          ? Math.round(avg_women_safety * 100) / 100
          : null,
        avg_transit: avg_transit ? Math.round(avg_transit * 100) / 100 : null,
        avg_neighbourhood: avg_neighbourhood
          ? Math.round(avg_neighbourhood * 100) / 100
          : null,
      },
      200
    );
  })

  .get("/precautions/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Handle anonymous users
    if (error || !user) {
      const { allowed, viewCount } = await trackAnonymousPrecautionView(id);
      
      if (!allowed) {
        return ctx.json({ 
          error: "View limit reached. Please sign in to view more locations.",
          viewCount,
          maxViews: 3
        }, 403);
      }
      
      // Continue with the rest of the logic for anonymous users
    }

    const locationPrecautions = await db.precautions.findUnique({
      where: { location_id: id },
    });

    // Check if precautions are older than 1 days (to match the 1-day data window)
    const sevenDaysAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

    if (!locationPrecautions || locationPrecautions.created_at < sevenDaysAgo) {
      const location = await db.locations.findUnique({
        where: { id: id },
      });

      if (!location) {
        return ctx.json({ error: "Location not found" }, 404);
      }

      try {
        const generatedData = await generateTravelerWarnings(
          location.name,
          location.city,
          location.country
        );

        // Check if no recent data was found
        if (generatedData.dataRecency === "no_recent_data" || generatedData.warnings.length === 0) {
          return ctx.json(
            {
              location_id: id,
              warnings: [],
              dataRecency: generatedData.dataRecency,
              searchDate: generatedData.searchDate,
              travelerRelevance: generatedData.travelerRelevance,
              message: "No recent traveler-specific safety data found for this location in the last 7 days",
            },
            200
          );
        }

        const createdPrecautions = await db.precautions.upsert({
          where: {
            location_id: id,
          },
          update: {
            approved_precautions: generatedData as any,
            created_at: new Date()
          },
          create: {
            location_id: id,
            approved_precautions: generatedData as any,
          },
        });

        if (!createdPrecautions) {
          return ctx.json({ error: "Error getting precautions" }, 500);
        }

        return ctx.json(
          {
            location_id: createdPrecautions.location_id,
            warnings: createdPrecautions.approved_precautions,
            created_at: createdPrecautions.created_at,
          },
          200
        );
      } catch (error) {
        console.log(error);
        return ctx.json({ error: "Error getting precautions" }, 500);
      }
    }
    
    return ctx.json(
      {
        location_id: locationPrecautions.location_id,
        warnings: locationPrecautions.approved_precautions,
        created_at: locationPrecautions.created_at,
      },
      200
    );
  })

  .get('/extra_info/:id',async(ctx)=>{

     const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

   if (error || !user) {
      const { allowed, viewCount } = await trackAnonymousPrecautionView(id);
      
      if (!allowed) {
        return ctx.json({ 
          error: "View limit reached. Please sign in to view more locations.",
          viewCount,
          maxViews: 3
        }, 403);
      }
      
      
    }

    const locationPrecautions = await db.precautions.findUnique({
      where: { location_id: id },
    });

    // Check if precautions are older than 1 days (to match the 1-day data window)
    const sevenDaysAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

    const date = locationPrecautions?.extra_info_updated_at ??  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)

    if (!locationPrecautions || date < sevenDaysAgo) {
      const location = await db.locations.findUnique({
        where: { id: id },
      });

      if (!location) {
        return ctx.json({ error: "Location not found" }, 404);
      }

      try{
        const generatedData = await generateLocationMetrics(
          location.name,
          location.city,
          location.country
        )

        const createdMetrics = await db.precautions.upsert({
          where:{
            location_id:id,
          },
          update:{
            extra_info: generatedData as any,
            extra_info_updated_at:new Date(),
          },
          create:{
            location_id:id,
            extra_info:generatedData as any
          }
        })

        if(!createdMetrics){
          return ctx.json({error:"Error getting metrics"},500)
        }

        return ctx.json(generatedData,200)

      }catch(error){
        return ctx.json({error:"Error getting data"},500);
      }
    }

    return ctx.json(locationPrecautions.extra_info,200)

  })

  

  .get("/comments/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      const { allowed, viewCount } = await trackAnonymousPrecautionView(id);
      
      if (!allowed) {
        return ctx.json({ 
          error: "View limit reached. Please sign in to view more locations.",
          viewCount,
          maxViews: 3
        }, 403);
      }
      
      // Continue with the rest of the logic for anonymous users
    }

    const locationComments = await db.comments.findMany({
      where: { location_id: id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    if (locationComments.length === 0) {
      return ctx.json({ locationComments }, 200);
    }
    if (!locationComments) {
      return ctx.json({ Error: "Error getting comments" }, 500);
    }

    return ctx.json({ locationComments }, 200);
  })

  .get("/location_stats/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const posts = await db.posts.count({
      where: { location_id: id },
    });

    const comments = await db.comments.count({
      where: { location_id: id },
    });

    const followers = await db.locations.findUnique({
      where: { id: id },
      select: {
        followers_count: true,
      },
    });

    return ctx.json({ posts, comments, followers }, 200);
  })

  .post(
    "/createLocationByCoord",
    zValidator(
      "json",
      z.object({
        city: z.string().nullable(),
        country: z.string(),
        name: z.string(),
        long: z.number(),
        lat: z.number(),
      })
    ),
    async (ctx) => {
      const values = ctx.req.valid("json");
      const location = await db.$queryRaw<location[]>`
  INSERT INTO locations (country, city, name, geog)
  VALUES (
    ${values.country},
    ${values.city},
    ${values.name},
    ST_SetSRID(ST_MakePoint(${values.long}, ${values.lat}), 4326)
  )
  RETURNING id, country, city, name, created_at, ${values.lat} as lat, ${values.long} as lon;
`;

      if (!location || (Array.isArray(location) && location.length === 0)) {
        return ctx.json({ error: "Error creating location" }, 404);
      }

      return ctx.json({ location }, 200);
    }
  );

export default app;
