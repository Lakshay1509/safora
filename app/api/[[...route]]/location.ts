import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from 'crypto';
import { createClient } from "@/utils/supabase/server";

const app = new Hono()

  .get("/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const location = await db.locations.findUnique({
      where: { id: id },
    });

    if (!location) {
      return ctx.json({ error: "Location not found" }, 404);
    }
    return ctx.json({ location }, 200);
  })
  .get("/reviews/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const locationReview = await db.location_scores.findUnique({
      where: { location_id: id },
    });

    if (!locationReview) {
      return ctx.json({ error: "Location not found" }, 404);
    }
    return ctx.json({ locationReview }, 200);
  })
  .get("/precautions/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const locationPrecautions = await db.precautions.findUnique({
      where: { location_id: id },
    });

    if (!locationPrecautions) {
      return ctx.json({ error: "Location not found" }, 404);
    }
    return ctx.json({ locationPrecautions }, 200);
  })

  .get("/comments/:id", async (ctx) => {
    const id = ctx.req.param("id");
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const locationComments = await db.comments.findMany({
      where: { location_id: id },
      include: {
        users: {
          select: {
            id: true,
            name: true, 
          },
        },
      },
    });

    if (!locationComments || locationComments.length === 0) {
      return ctx.json({ error: "No comments found for this location" }, 404);
    }

    return ctx.json({ locationComments }, 200);
  })

  

  .post("/addComment",zValidator(
    "json",
    z.object({
        id : z.string(),
        text:z.string(),
    })
  )
    ,async(ctx)=>{

   
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const values = ctx.req.valid("json");

    const comment = await db.comments.create({
      data:{
        user_id:user.id,
        location_id:values.id,
        text:values.text,
        comment_id:randomUUID()

      }
    })

    if(comment){
      return ctx.json({comment});
    }

    return ctx.json({error:"Error creating comment"},500)

  })

export default app;
