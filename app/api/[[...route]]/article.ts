import cloudinaryService from "@/lib/cloudinary-service";
import { db } from "@/lib/prisma";
import { generateSlug } from "@/utils/slug";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

const app = new Hono()

  .post(
    "/add",
    zValidator(
      "json", // Changed from "form" to "json"
      z.object({
        heading: z.string().min(10).max(250),
        body: z.string().min(10).max(15000),
        image_url: z.string().url().optional(), // Just receive the URL
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

      // No file processing - just use the URL
      const article = await db.posts.create({
        data: {
          heading: values.heading,
          body: values.body,
          user_id: user.id,
          slug: generateSlug(values.heading),
          image_url: values.image_url,
          is_article: 1,
        },
      });

      if (article) {
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
            updated_at: new Date(),
            active_today: true,
          },
        });
        return ctx.json({ article }, 200);
      }

      return ctx.json({ error: "Error creating article" }, 500);
    }
  )
  .put(
    "/update/:id",
    zValidator(
      "json", // Changed from "form" to "json"
      z.object({
        heading: z.string().min(10).max(250),
        body: z.string().min(10).max(15000),
        image_url: z.string().url().optional(), // Just receive the URL
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

      const find_article = await db.posts.findUnique({
        where: { id: id },
      });

      if (!find_article) {
        return ctx.json({ error: "No article found" }, 500);
      }

      if (find_article.user_id !== user.id) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      // No file processing - just use the URL
      const article = await db.posts.update({
        where: { id: id, user_id: user.id },
        data: {
          heading: values.heading,
          body: values.body,
          slug: generateSlug(values.heading),
          ...(values.image_url && { image_url: values.image_url }),
        },
      });

      if (article) {
        return ctx.json({ article }, 200);
      }

      return ctx.json({ error: "Error updating article" }, 500);
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
      return ctx.json({ error: "Error deleting article" }, 500);
    }

    return ctx.json({ post }, 200);
  });

export default app;
