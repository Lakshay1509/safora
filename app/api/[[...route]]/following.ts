import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from 'crypto';
import { createClient } from "@/utils/supabase/server";

const app = new Hono()

.get("/:id",async(ctx)=>{
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const location_id = ctx.req.param("id");

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const data = await db.user_location_follows.findUnique({
      where:{
        user_id_location_id:{
          user_id:user.id,
          location_id:location_id
        }
      }
    })

    // Return data or null with a 200 status
    return ctx.json({data},200);
})

.post("/",zValidator("json",z.object({
    location_id : z.string().uuid()
})),async(ctx)=>{

    const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        const { location_id } = ctx.req.valid("json");

        if (error || !user) {
            return ctx.json({ error: "Unauthorized" }, 401);
        }

        const values = ctx.req.valid("json");
    
    const follow = await db.user_location_follows.create({
        data:{
            ...values,
            user_id:user.id

        }
        
    })

    if(!follow){
        return ctx.json({error:"Error creating follow"},500);
    }
    return ctx.json({follow},200);
})

.delete("/:id",async(ctx)=>{

    const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        const location_id = ctx.req.param("id");

        if (error || !user) {
            return ctx.json({ error: "Unauthorized" }, 401);
        }
    
    const follow = await db.user_location_follows.delete({
        where:{
            user_id_location_id:{
                user_id:user.id,
                location_id:location_id
            }
        }
    })

    if(!follow){
        return ctx.json({error:"Error deleting follow"},500);
    }
    return ctx.json({follow},200);
})

export default app;