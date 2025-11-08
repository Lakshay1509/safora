import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

interface posts {
  heading: string;
  body: string;
  id: string;
  slug: string;
  upvotes: number;
  comment_count: number;
  image_url: string;
}

const app = new Hono()
  .get(
    "/recent",
    zValidator(
      "query",
      z.object({
        page: z.string().optional().default("1"),
        limit: z.string().optional().default("10"),
      })
    ),
    async (ctx) => {
      const { page, limit } = ctx.req.valid("query");
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // fetch posts with +1 for hasMore detection
      const posts = await db.posts.findMany({
        where: { is_article: 0 },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limitNum + 1,
        include: {
          users: {
            select: {
              id: true,
              name: true,
              profile_url: true,
              profile_color:true,
              verified:true
            },
          },
          locations: {
            select: {
              name: true,
              id: true,
            },
          },
          _count: {
            select: {
              posts_comments: true,
            },
          },
        },
      });

      const hasMore = posts.length > limitNum;
      const paginatedPosts = posts.slice(0, limitNum);

      // fetch all user votes for these posts in one query
      let userVotes: { post_id: string; vote_type: number }[] = [];
      if (user) {
        userVotes = await db.votes.findMany({
          where: {
            user_id: user.id,
            post_id: { in: paginatedPosts.map((p) => p.id) },
          },
          select: { post_id: true, vote_type: true }, // make sure your votes table has "value"
        });
      }

      const voteMap = new Map(
        userVotes.map((v) => [v.post_id, v.vote_type]) // e.g. { "123": 1 }
      );

      const data = paginatedPosts.map((post) => ({
        ...post,
        upvote: voteMap.get(post.id) ?? -1, // 1 if upvoted, -1 otherwise
      }));

      return ctx.json({ data, hasMore }, 200);
    }
  )

  .get("/articles", async (ctx) => {
    const posts = await db.posts.findMany({
      where: { is_article: 1 },
      orderBy: {
        created_at: "desc",
      },
      take: 500,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_url: true,
            profile_color:true
          },
        },
        _count: {
          select: {
            posts_comments: true,
          },
        },
      },
    });

    if (!posts) {
      return ctx.json({ error: "Error getting posts" }, 500);
    }

    return ctx.json({ posts }, 200);
  })

  .get("/following", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    // Get limit from query parameters with default value
    const limitParam = ctx.req.query("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Optional: Set maximum limit to prevent abuse
    const maxLimit = Math.min(limit, 50);

    const posts = await db.$queryRaw<posts[]>`
          SELECT p.id, p.user_id, p.location_id, p.heading, p.body, p.upvotes, p.created_at, p.slug, p.image_url,
                 COALESCE(c.comment_count, 0) AS comment_count
          FROM posts p
          INNER JOIN user_location_follows ulf ON p.location_id = ulf.location_id
          LEFT JOIN (
              SELECT post_id, COUNT(*)::INTEGER AS comment_count
              FROM posts_comments
              GROUP BY post_id
          ) c ON p.id = c.post_id
          WHERE ulf.user_id = ${user.id}::uuid  
          ORDER BY p.created_at DESC
          LIMIT ${maxLimit};
          `;

    return ctx.json({ posts }, 200);
  })

  .get("/trending", async (ctx) => {
    // First query: Group by location_id
    const locations = await db.reviews.groupBy({
      by: ["location_id"],
      _count: { location_id: true },
      orderBy: { _count: { location_id: "desc" } },
      take: 10,
    });

    // Extract location IDs
    const locationIds = locations.map((l) => l.location_id);

    // Second query: Fetch location names
    const locationDetails = await db.locations.findMany({
  where: { id: { in: locationIds } },
  select: { id: true, name: true, reviews1: true },
});

// Merge the results
const result = locations.map((loc) => {
  const detail = locationDetails.find(
    (detail) => detail.id === loc.location_id
  );
  
  return {
    ...loc,
    location_name: detail?.name,
    reviews1: detail?.reviews1,
    review_count: loc._count.location_id
  };
});

    if(!locations || !result){
      return ctx.json({error:"Error getting trednign locations"},500);
    }

    return ctx.json({result},200);
  })

  .get('/trending-page', async (ctx) => {
    try {
      // Get top 10 locations with most reviews
      const topLocations = await db.reviews.groupBy({
        by: ["location_id"],
        _count: { location_id: true },
        orderBy: { _count: { location_id: "desc" } },
        take: 10,
      });

      const locationIds = topLocations.map((l) => l.location_id);

      // Get location details with names
      const locationDetails = await db.locations.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true, reviews1: true },
      });

      // Get day and night ratings for these locations
      const [dayRatings, nightRatings] = await Promise.all([
        db.reviews.groupBy({
          by: ["location_id"],
          where: {
            location_id: { in: locationIds },
            time_of_day: "DAY",
          },
          _avg: {
            general_score: true,
          },
        }),
        db.reviews.groupBy({
          by: ["location_id"],
          where: {
            location_id: { in: locationIds },
            time_of_day: "NIGHT",
          },
          _avg: {
            general_score: true,
          },
        }),
      ]);

      // Create maps for easy lookup
      const dayRatingMap = new Map(
        dayRatings.map((r) => [r.location_id, r._avg.general_score])
      );
      const nightRatingMap = new Map(
        nightRatings.map((r) => [r.location_id, r._avg.general_score])
      );

      // Merge all location data
      const locationsData = topLocations.map((loc) => {
        const detail = locationDetails.find((d) => d.id === loc.location_id);
        return {
          location_id: loc.location_id,
          name: detail?.name,
          total_reviews: loc._count.location_id + Number(detail?.reviews1 ?? 0),
          day_rating: dayRatingMap.get(loc.location_id) 
            ? Math.round((dayRatingMap.get(loc.location_id)! / 5) * 100) 
            : null,
          night_rating: nightRatingMap.get(loc.location_id)
            ? Math.round((nightRatingMap.get(loc.location_id)! / 5) * 100)
            : null,
        };
      });

      // Get top 20 posts by engagement (upvotes + comments)
      const topPosts = await db.posts.findMany({
        where: { is_article: 0 },
        select: {
          id: true,
          heading: true,
          body: true,
          upvotes: true,
          created_at: true,
          slug: true,
          image_url: true,
          users: {
            select: {
              name: true,
              profile_url: true,
              profile_color: true,
            },
          },
          locations: {
            select: {
              name: true,
              id: true,
            },
          },
          _count: {
            select: {
              posts_comments: true,
            },
          },
        },
        orderBy: [
          { upvotes: "desc" },
        ],
        take: 100, // Get more to sort by engagement
      });

      // Calculate engagement score and sort
      const sortedPosts = topPosts
        .map((post) => ({
          ...post,
          engagement: post.upvotes + post._count.posts_comments,
          comments: post._count.posts_comments,
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 20);

      return ctx.json(
        {
          locations: locationsData,
          posts: sortedPosts,
        },
        200
      );
    } catch (error) {
      console.error("Error fetching trending page data:", error);
      return ctx.json({ error: "Failed to fetch trending data" }, 500);
    }
  });


export default app;
