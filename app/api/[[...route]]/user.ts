import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from 'crypto';
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
      where: {id:user.id},
    });

    if (!userData) {
      return ctx.json({ error: "User not found" }, 404);
    }
    return ctx.json({ userData }, 200);
  })


export default app