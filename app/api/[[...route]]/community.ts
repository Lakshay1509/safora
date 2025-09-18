import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";


interface posts{
  heading:string,
  body:string,
  id:string,
  slug:string,
  upvotes:number,
  comment_count:number,
  image_url:string

}

const app = new Hono()
  .get("/recent", async (ctx) => {
    const posts = await db.posts.findMany({
      where:{is_article:0},
      orderBy: {
        created_at: "desc",
      },
      take: 500,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_url:true
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
            posts_comments: true
          }
        }
      },
    });

    if (!posts) {
      return ctx.json({ error: "Error getting posts" }, 500);
    }

    return ctx.json({ posts }, 200);
  })

  .get("/articles", async (ctx) => {
    const posts = await db.posts.findMany({

      where:{is_article:1},
      orderBy: {
        created_at: "desc",
      },
      take: 500,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_url:true
          },
        },
        _count: {
          select: {
            posts_comments: true
          }
        }
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
    const limitParam = ctx.req.query('limit');
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
    
    return ctx.json({posts}, 200);
})

.get("/trending", async (ctx) => {
    const locations = await db.posts.groupBy({
      by : ['location_id'],
      _count :{location_id:true},
      orderBy:{_count:{location_id:'desc'}},
      take:3
    })

    if(!locations){
      return ctx.json({error:"Error getting trending"},500);
    }

    return ctx.json({locations},200);

  })


  

export default app;
