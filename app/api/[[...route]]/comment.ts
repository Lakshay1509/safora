import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from 'crypto';
import { createClient } from "@/utils/supabase/server";

const app = new Hono()
    .post("/add",zValidator(
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
            updated_at: new Date().toISOString(),
          },
        });
    }

    return ctx.json({error:"Error creating comment"},500)

  })
  .put("/edit",zValidator(
    "json",
    z.object({
      comment_id:z.string(),
      location_id:z.string(),
      text:z.string(),
    })
  ),async(ctx)=>{

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const values = ctx.req.valid("json");

    const comment = await db.comments.update({
      where: {
      comment_id: values.comment_id,
    },
      data:{
        user_id:user.id,
        text:values.text,
        location_id:values.location_id,
      }
    })


    if(comment){
      return ctx.json({comment});
    }

    return ctx.json({error:"Error updating comment"},500);
  })
  .delete("/delete", zValidator(
    "json",
    z.object({
      comment_id: z.string(),
    })
  ), async (ctx) => {

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const values = ctx.req.valid("json");

      
      const existingComment = await db.comments.findFirst({
        where: {
          comment_id: values.comment_id,
          user_id: user.id, 
        }
      });

      if (!existingComment) {
        return ctx.json({ error: "Comment not found or unauthorized" }, 404);
      }

      
      const comment = await db.comments.delete({
        where: {
          comment_id: values.comment_id,
        }
      });

      if(comment){
        return ctx.json({comment});
      }

      return ctx.json({error:"Error deleting comment"},500);
    
  })



export default app;