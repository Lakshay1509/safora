import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/utils/supabase/server";
import { error } from "console";

const app = new Hono()
.get("/recent", async (ctx) => {
  const posts = await db.posts.findMany({
    orderBy: {
      created_at: "desc",
    },
    take: 500,
    include: {
      users: {
        select:{

            id:true,
            name:true
        }
      },
      locations: {
        select:{
            name:true,
            id:true
        }
      },
    },
  });

  if (!posts) {
    return ctx.json({ error: "Error getting posts" }, 500);
  }

  return ctx.json({ posts }, 200);
});

export default app;
