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
    const time_of_day_param = ctx.req.param("time_of_day")
    const time_of_day = time_of_day_param as TimeOfDay;
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const locationReview = await db.location_scores.findUnique({
      where: { location_id: id },
    });

    if (!locationReview) {
      return ctx.json({ error: "Location not found" }, 404);
    }
    return ctx.json({ locationReview }, 200);
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
    
    });

    if (!locationComments || locationComments.length === 0) {
      return ctx.json({ error: "No comments found for this location" }, 404);
    }

    return ctx.json({ locationComments }, 200);
  })

  

  

export default app;
