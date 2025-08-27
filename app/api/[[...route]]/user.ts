import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";

const app = new Hono()

  .get("/default", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const userData = await db.public_users.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      return ctx.json({ error: "User not found" }, 404);
    }
    return ctx.json({ userData }, 200);
  })

  .get("/comments", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const comments = await db.comments.findMany({
      where: { user_id: user.id },
      include: {
        locations: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    if (comments.length === 0) {
      return ctx.json({ comments }, 200);
    }

    if (!comments) {
      return ctx.json({ Error: "Error getting comments" }, 500);
    }

    return ctx.json({ comments }, 200);
  })

  .get("/locations-count", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    // Get all location IDs from both comments and reviews tables in a single query
    const result = await db.$queryRaw`
        SELECT DISTINCT location_id 
        FROM (
          SELECT location_id FROM comments WHERE user_id = ${user.id}::uuid
          UNION
          SELECT location_id FROM reviews WHERE user_id = ${user.id}::uuid
        ) AS combined_locations
      `;

    if (!result) {
      return ctx.json({ error: "Failed to fetch locations count" }, 500);
    }

    const count = Array.isArray(result) ? result.length : 0;

    return ctx.json(
      {
        count,
        message:
          "Number of locations where user has at least one comment or review",
      },
      200
    );
  })

  .put(
    "/set_gender",
    zValidator(
      "json",
      z.object({
        gender: z.union([
          z.literal("male"),
          z.literal("female"),
          z.literal("other"),
        ]),
      })
    ),
    async (ctx) => {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      const values = ctx.req.valid("json");
      if (error || !user) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const updatedProfile = await db.public_users.update({
        where: { id: user.id },
        data: {
          ...values,
        },
      });

      if(!updatedProfile){
        return ctx.json({error:"Error updating profile"},500);
      }

      return ctx.json({updatedProfile},200);
    }
  );

export default app;
