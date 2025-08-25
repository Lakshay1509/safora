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

  .get("/comments",async(ctx)=>{
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

     if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const comments = await db.comments.findMany({
      where:{user_id:user.id},
      include:{
        locations:{
          select:{
            id:true,
            name:true,
          }
        }
      },
      orderBy:{created_at:"desc"}
    })

    if(comments.length===0){
      return ctx.json({comments},200);
    }

    if (!comments) {
      return ctx.json({ Error: "Error getting comments" }, 500);
    }

    return ctx.json({comments},200);
    
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

  
    const distinctLocations = await db.comments.findMany({
      where: {
        user_id: user.id
      },
      select: {
        location_id: true
      },
      distinct: ['location_id']
    });

    const count = distinctLocations.length;

    return ctx.json({ 
      count,
      message: "Number of locations where user has at least one comment" 
    }, 200);
  })



export default app