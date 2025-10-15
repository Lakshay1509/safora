import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

const app = new Hono()
  .get("/default", async (ctx) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const streak = await db.streak.findUnique({
        where: { user_id: user.id },
        select: { count: true },
      });

      const uniqueLocationReviews = await db.reviews.groupBy({
        by: ["location_id"],
        where: { user_id: user.id },
        _count: { location_id: true },
      });

      const postCount = await db.posts.count({
        where: {
          user_id: user.id,
          is_article: 0,
        },
      });
      const articlesCount = await db.posts.count({
        where: {
          user_id: user.id,
          is_article: 1,
        },
      });

      const upvotesData = await db.posts.aggregate({
        where: { user_id: user.id },
        _sum: { upvotes: true },
      });

      return ctx.json(
        {
          streakCount: streak?.count || 0,
          uniqueLocationReviews: uniqueLocationReviews.length,
          postCount,
          articlesCount,
          totalUpvotes: upvotesData._sum.upvotes || 0,
        },
        200
      );
    } catch (error) {
      return ctx.json({ error: "Failed to fetch user stats" }, 500);
    }
  })
  .post(
    "/addBadge",
    zValidator(
      "json",
      z.object({
        id: z.number().min(1).max(6),
        streak: z.number(),
        uniqueLocationReviews: z.number(),
        postCount: z.number(),
        articlesCount: z.number(),
        upvotesData: z.number(),
      })
    ),
    async (ctx) => {
      try {
        const supabase = await createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }

        const values = ctx.req.valid("json");

        const streak = await db.streak.findUnique({
          where: { user_id: user.id },
          select: { count: true },
        });

        const uniqueLocationReviews = await db.reviews.groupBy({
          by: ["location_id"],
          where: { user_id: user.id },
          _count: { location_id: true },
        });

        const postCount = await db.posts.count({
          where: {
            user_id: user.id,
            is_article: 0,
          },
        });
        const articlesCount = await db.posts.count({
          where: {
            user_id: user.id,
            is_article: 1,
          },
        });

        const upvotesData = await db.posts.aggregate({
          where: { user_id: user.id },
          _sum: { upvotes: true },
        });

        const streakCount = streak?.count ?? 0;
        const reviewsCount = uniqueLocationReviews.length;
        const totalUpvotes = upvotesData._sum?.upvotes ?? 0;

        const isEligible =
          streakCount >= values.streak &&
          reviewsCount >= values.uniqueLocationReviews &&
          postCount >= values.postCount &&
          articlesCount >= values.articlesCount &&
          totalUpvotes >= values.upvotesData;

        if (!isEligible) {
          return ctx.json({ error: "Error getting badge" }, 500);
        }

        const colourCode : Record<number,string> = {
          1 :'#38bdf8',
          2: '#22c55e',
          3: '#3b82f6',
          4: '#a855f7',
          5: '#eab308',
          6: '#ef4444'
        }

        const achievment = await db.public_users.update({
          where:{id:user.id},
          data:{
            profile_color:colourCode[values.id]
          }
        })

        if(!achievment){
          return ctx.json({ error: "Error getting badge" }, 500);

        }
        return ctx.json({achievment},200);
      } catch (error) {
        return ctx.json({ error: "Failed to fetch user stats" }, 500);
      }
    }
  );

export default app;
