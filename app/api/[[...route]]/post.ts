import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { generateSlug } from "@/utils/slug";
import cloudinaryService from "@/lib/cloudinary-service";

const app = new Hono()
  .post(
    "/add/:location_id",
    zValidator(
      "form",
      z.object({
        heading: z.string().min(10).max(250),
        body: z.string().min(10).max(1500),
        image: z.preprocess(
          (arg) => (arg instanceof File && arg.size > 0 ? arg : undefined),
          z.instanceof(File).optional()
        ),
      })
    ),

    async (ctx) => {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      const location_id = ctx.req.param("location_id");

      if (error || !user) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const values = ctx.req.valid("form");
      const file = values.image;

      let imageUrl: string | undefined;

      if (file && file instanceof File && file.size > 0) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);

          const uploadResult = await cloudinaryService.uploadPostImage(
            buffer,
            user.id
          );
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return ctx.json({ error: "Image upload failed" }, 500);
        }
      }

      const post = await db.posts.create({
        data: {
          heading:values.heading,
          body:values.body,
          user_id: user.id,
          location_id: location_id,
          slug: generateSlug(values.heading),
          image_url: imageUrl,
        },
      });

      if (post) {
        return ctx.json({ post }, 200);
      }

      return ctx.json({ error: "Error creating post" }, 500);
    }
  )

  .get("/by-ID/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const post = await db.posts.findUnique({
      where: { id: id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_url:true
          },
        },
        _count:{
          select:{
            posts_comments:true
          }
        }
      },
    });

    if (!post) {
      return ctx.json({ error: "Error getting post" }, 500);
    }

    return ctx.json({ post }, 200);
  })

  .get("/by-locationId/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const posts = await db.posts.findMany({
      where: { location_id: id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            profile_url: true,
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
      return ctx.json({ error: "Error getting post" }, 500);
    }

    // Fetch all user votes for these posts in one query (same pattern as community.ts)
    let userVotes: { post_id: string; vote_type: number }[] = [];
    if (user) {
      userVotes = await db.votes.findMany({
        where: {
          user_id: user.id,
          post_id: { in: posts.map((p) => p.id) },
        },
        select: { post_id: true, vote_type: true },
      });
    }

    const voteMap = new Map(
      userVotes.map((v) => [v.post_id, v.vote_type])
    );

    const data = posts.map((post) => ({
      ...post,
      upvote: voteMap.get(post.id) ?? -1, // 1 if upvoted, -1 otherwise
    }));

    return ctx.json({ post: data }, 200);
  })

  .get("/comments/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const post_comments = await db.posts_comments.findMany({
      where: { post_id: id ,parent_id:null},
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
          other_posts_comments: true, 
        },
      },
      },
      orderBy:{created_at:'asc'}
    });

    if (!post_comments) {
      return ctx.json({ error: "Error getting post comments" }, 500);
    }

    return ctx.json({ post_comments }, 200);
  })

  .get("/stats/:id", async (ctx) => {
    const id = ctx.req.param("id");

    const upvotes = await db.posts.findUnique({
      where: {
        id: id,
      },
      select: {
        upvotes: true,
      },
    });

    const comment_count = await db.posts_comments.count({
      where: { post_id: id },
    });

    if(!upvotes){
      return ctx.json({error :"Error getting upvotes"},500);
    }

    return ctx.json({upvotes,comment_count},200);
  })

  .put(
    "/update/:id",
    zValidator(
      "json",
      z.object({
        heading: z.string().min(10).max(250),
        body: z.string().min(10).max(1500),
        locationId:z.string()
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
      const id = ctx.req.param("id");

      const values = ctx.req.valid("json");

      const find_post = await db.posts.findUnique({
        where: { id: id },
      });

      if (!find_post) {
        return ctx.json({ error: "No post found" }, 500);
      }

      if (find_post.user_id !== user.id) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const post = await db.posts.update({
        where: {
          id: id,
        },
        data: {
          heading:values.heading,
          body:values.body,
          location_id:values.locationId
        },
      });

      if (!post) {
        return ctx.json({ error: "Error updating post" }, 500);
      }

      return ctx.json({ post }, 200);
    }
  )

  .delete("/delete/:id", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
    const id = ctx.req.param("id");

    const find_post = await db.posts.findUnique({
      where: { id: id },
    });

    if (!find_post) {
      return ctx.json({ error: "No post found" }, 500);
    }

    if (find_post.user_id !== user.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const post = await db.posts.delete({
      where: {
        id: id,
      },
    });

    if (!post) {
      return ctx.json({ error: "Error updating post" }, 500);
    }

    return ctx.json({ post }, 200);
  });

export default app;
