import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Hono } from "hono";

const app = new Hono().get("/default", async (ctx) => {
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
});

export default app;
