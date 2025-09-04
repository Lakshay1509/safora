import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { generateLocationPrecautions } from "@/lib/gemini-service";
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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
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
    // const supabase = await createClient();
    // const {
    //   data: { user },
    //   error,
    // } = await supabase.auth.getUser();

    // if (error || !user) {
    //   return ctx.json({ error: "Unauthorized" }, 401);
    // }

    const location = await db.locations.findUnique({
      where: { id: id },
    });

    if (!location) {
      return ctx.json({ error: "Location not found" }, 404);
    }
    return ctx.json({ location }, 200);
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
    // const supabase = await createClient();
    // const {
    //   data: { user },
    //   error,
    // } = await supabase.auth.getUser();

    // if (error || !user) {
    //   return ctx.json({ error: "Unauthorized" }, 401);
    // }

    const locationPrecautions = await db.precautions.findUnique({
      where: { location_id: id },
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (!locationPrecautions || locationPrecautions.created_at < oneDayAgo) {
       const location = await db.locations.findUnique({
        where: { id: id },
      });

      if (!location) {
        return ctx.json({ error: "Location not found" }, 404);
      }
      
      try{
        const generatedData = await generateLocationPrecautions(
          location.name,
          location.city,
          location.country
        )

        const createdPrecautions = await db.precautions.upsert({
  where: {
    location_id: id,
  },
  update: {
    approved_precautions: generatedData,
    created_at:new Date()
  },
  create: {
    location_id: id,
    approved_precautions: generatedData,
  },
})

        if(!createdPrecautions){
          return ctx.json({error:"Error getting precautions"},500);
        }

        return ctx.json({location_id:createdPrecautions.location_id,approved_precautions:createdPrecautions.approved_precautions,created_at:createdPrecautions.created_at},200)
      }
      catch(error){
        console.log(error)
        return ctx.json({error:"Error getting precautions"},500)
      }
    }
    return ctx.json( locationPrecautions , 200);
  })

  .get("/comments/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    // const {
    //   data: { user },
    //   error,
    // } = await supabase.auth.getUser();

    // if (error || !user) {
    //   return ctx.json({ error: "Unauthorized" }, 401);
    // }

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

  .get("/location_stats/:id",async(ctx)=>{


      const id = ctx.req.param("id");
      const posts = await db.posts.count({
        where:{location_id:id}
      })

      const comments = await db.comments.count({
        where:{location_id:id}
      })

      
      return ctx.json({posts,comments},200)
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
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

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
