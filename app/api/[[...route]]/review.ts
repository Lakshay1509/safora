import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from 'crypto';
import { createClient } from "@/utils/supabase/server";

// Define the TimeOfDay enum to match your database schema
// You might need to import this from your Prisma client if already defined there
enum TimeOfDay {
  DAY = "DAY",
  NIGHT = "NIGHT"
}

const app = new Hono()

    .post("/add/:location_id",zValidator(
    "json",
   z.object({
    general_score: z.number(),
    transit_score: z.number().nullable().default(null),
    neighbourhood_score: z.number().nullable().default(null),
    women_score: z.number().nullable().default(null),
    time_of_day: z.string()
})

  )
    ,async(ctx)=>{

    const location_id = ctx.req.param("location_id");

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
    const values = ctx.req.valid("json");
    
    
    let time_of_day: TimeOfDay | null = null;
    if(values.time_of_day === "DAY"){
      time_of_day = TimeOfDay.DAY;
    }
    else if(values.time_of_day === "NIGHT"){
      time_of_day = TimeOfDay.NIGHT;
    }


    if(userData.gender==='female'){

      const review = await db.reviews.create({
        data:{
          id:randomUUID(),
          user_id:user.id,
          location_id: location_id,
          general_score:values.general_score,
          women_safety_score:values.women_score,
          neighbourhood_score:values.neighbourhood_score,
          transit_score:values.transit_score,
          time_of_day : time_of_day
          
        }
        
      })

      if(review){
      return ctx.json({review});
    }

    return ctx.json({error:"Error creating review"},500)
      
    }
    else{

      const review = await db.reviews.create({
        data:{
          id:randomUUID(),
          user_id:user.id,
          location_id: location_id,
          general_score:values.general_score,
          women_safety_score:null,
          neighbourhood_score:values.neighbourhood_score,
          transit_score:values.transit_score,
          time_of_day:time_of_day
        }
        
      })

      if(review){
      return ctx.json({review});
    }

    return ctx.json({error:"Error creating review"},500)

    }

    })

export default app;