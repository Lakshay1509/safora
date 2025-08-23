import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
enum TimeOfDay {
  DAY = "DAY",
  NIGHT = "NIGHT",
}

const app = new Hono()

  .get("/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

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

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const locationPrecautions = await db.precautions.findUnique({
      where: { location_id: id },
    });

    if (!locationPrecautions) {
      return ctx.json({ error: "Location not found" }, 404);
    }
    return ctx.json({ locationPrecautions }, 200);
  })

  .get("/comments/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
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
      orderBy:{created_at:'desc'}
    });

    if (!locationComments || locationComments.length === 0) {
      return ctx.json({ error: "No comments found for this location" }, 404);
    }

    return ctx.json({ locationComments }, 200);
  });

export default app;
