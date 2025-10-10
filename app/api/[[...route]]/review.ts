import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

// Define the TimeOfDay enum to match your database schema
// You might need to import this from your Prisma client if already defined there
enum TimeOfDay {
  DAY = "DAY",
  NIGHT = "NIGHT",
}

const app = new Hono()

  .get("/byUser/:location_id/:time_of_day", async (ctx) => {
    const location_id = ctx.req.param("location_id");
    const time_of_day_param = ctx.req.param("time_of_day");
    if (!Object.values(TimeOfDay).includes(time_of_day_param as TimeOfDay)) {
      return ctx.json({ error: "Invalid time_of_day parameter" }, 400);
    }

    const time_of_day = time_of_day_param as TimeOfDay;
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const review = await db.reviews.findFirst({
      where: {
        location_id: location_id,
        user_id: user.id,
        time_of_day: time_of_day,
      },
    });

    if (!review) {
      return ctx.json({ review: null }, 200);
    }
    return ctx.json({ review }, 200);
  })

  .post(
    "/add/:location_id/:time_of_day",
    zValidator(
      "json",
      z.object({
        general_score: z.number(),
        transit_score: z.number().nullable().default(null),
        neighbourhood_score: z.number().nullable().default(null),
        women_score: z.number().nullable().default(null),
      })
    ),
    async (ctx) => {
      
        const location_id = ctx.req.param("location_id");
        const values = ctx.req.valid("json");

        // Authentication
        const supabase = await createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }

        // Get user data
        const userData = await db.public_users.findUnique({
          where: { id: user.id },
        });

        if (!userData) {
          return ctx.json({ error: "User not found" }, 404);
        }

        // Direct assignment instead of using TimeOfDay[values.time_of_day]
       const time_of_day_param = ctx.req.param("time_of_day");
       const time_of_day = time_of_day_param as TimeOfDay

        // Prepare review data
        const reviewData = {
          id: randomUUID(),
          user_id: user.id,
          location_id,
          general_score: values.general_score,
          neighbourhood_score: values.neighbourhood_score,
          transit_score: values.transit_score,
          time_of_day,
          women_safety_score:
            userData.gender === "female" ? values.women_score : null,
        };
        // Create review
        const review = await db.reviews.create({
          data: reviewData,
        });

        

        if(review){
          const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);

        await db.streak.updateMany({
          where: {
            user_id: user.id,
            updated_at: {
              lt: startOfToday,
            },
          },
          data: {
            count: {
              increment: 1,
            },
            updated_at: new Date().toISOString(),
          },
        });
          return ctx.json({ review }, 200);
        }
        return ctx.json({ error: "Error creating review" }, 500);
      
    }
  )

  .delete("/delete/:location_id/:time_of_day", async (ctx) => {
    const supabase = await createClient();
    const location_id = ctx.req.param("location_id");
    const time_of_day_param = ctx.req.param("time_of_day");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
    const time_of_day = time_of_day_param as TimeOfDay;

    const review = await db.reviews.findFirst({
      where: {
        location_id: location_id,
        user_id: user.id,
        time_of_day : time_of_day
      },
    });

    if (!review) {
      return ctx.json(
        { error: "Review not found for this location by the current user" },
        404
      );
    }

    const deleteReview = await db.reviews.delete({
      where: { id: review.id },
    });

    if (!deleteReview) {
      return ctx.json({ error: "Error deleting review" }, 500);
    }

    return ctx.json({ deleteReview }, 200);
  })

  .put(
    "/edit/:location_id/:time_of_day",
    zValidator(
      "json",
      z.object({
        general_score: z.number(),
        transit_score: z.number().nullable().default(null),
        neighbourhood_score: z.number().nullable().default(null),
        women_score: z.number().nullable().default(null),
      })
    ),
    async (ctx) => {
      const location_id = ctx.req.param("location_id");
      const time_of_day_param = ctx.req.param("time_of_day");
      const values = ctx.req.valid("json");

      // Authentication
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      // Validate time_of_day parameter
      if (!Object.values(TimeOfDay).includes(time_of_day_param as TimeOfDay)) {
        return ctx.json({ error: "Invalid time_of_day parameter" }, 400);
      }
      const time_of_day = time_of_day_param as TimeOfDay;

      // Find the existing review
      const existingReview = await db.reviews.findFirst({
        where: {
          location_id: location_id,
          user_id: user.id,
          time_of_day: time_of_day,
        },
      });

      if (!existingReview) {
        return ctx.json({ error: "Review not found" }, 404);
      }

      // Get user data for women_safety_score
      const userData = await db.public_users.findUnique({
        where: { id: user.id },
      });

      if (!userData) {
        return ctx.json({ error: "User not found" }, 404);
      }

      // Update review
      const updatedReview = await db.reviews.update({
        where: { id: existingReview.id },
        data: {
          general_score: values.general_score,
          neighbourhood_score: values.neighbourhood_score,
          transit_score: values.transit_score,
          women_safety_score:
            userData.gender === "female" ? values.women_score : null,
        },
      });

      if (!updatedReview) {
        return ctx.json({ error: "Error updating review" }, 500);
      }

      return ctx.json({ updatedReview }, 200);
    }
  );

export default app;
