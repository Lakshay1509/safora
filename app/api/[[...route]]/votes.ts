import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

const app = new Hono()

  .get("/:id", async (ctx) => {
    const post_id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const upvotes = await db.votes.findUnique({
      where: {
        user_id_post_id: {
          post_id: post_id,
          user_id: user.id,
        },
      },
    });

    return ctx.json({ upvotes }, 200);
  })

  .post(
    "/",
    zValidator(
      "json",
      z.object({
        post_id: z.string().uuid(),
        vote_type: z.number().int(),
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

      const upvotes = await db.votes.upsert({
        where: {
          user_id_post_id: {
            user_id: user.id,
            post_id: values.post_id,
          },
        },
        update: {
          vote_type: values.vote_type,
        },
        create: {
          id: randomUUID(),
          user_id: user.id,
          post_id: values.post_id,
          vote_type: values.vote_type,
        },
      });

      if (!upvotes) {
        return ctx.json({ error: "Error creating follow" }, 500);
      }

      if (values.vote_type === 1) {
        const data = await db.posts.findUnique({
          where: { id: values.post_id },
          include: {
            users: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const userData = await db.public_users.findUnique({
          where: { id: user.id },
        });

        if (!data) {
          return ctx.json({ error: "Error getting post" }, 500);
        }

        await db.notifications.create({
          data: {
            user_id: data?.users?.id,
            sender_id: user.id,
            text: `${userData?.name} upvoted your post`,
          },
        });
      }

      return ctx.json({ upvotes }, 200);
    }
  );

export default app;
