import { Hono } from "hono";
import { db } from "@/lib/prisma";
import {zValidator} from "@hono/zod-validator"
import {z} from "zod";
import {createId} from "@paralleldrive/cuid2";
import {createClient} from "@/utils/supabase/server"


const app = new Hono()
    

    .get("/:id",async(ctx)=>{
        const id = ctx.req.param("id");
        const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
        
        if(error || !user){
            return ctx.json({error:"Unauthorized"},401);
        }

        const location = await db.locations.findUnique({
            where : {id:id}
        })

        

        if(!location){
            return ctx.json({error:"Location not found"},404);
        }
        return ctx.json({location},200);
    })
    .get("/reviews/:id",async(ctx)=>{
        const id = ctx.req.param("id");
        const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
        
        if(error || !user){
            return ctx.json({error:"Unauthorized"},401);
        }


        const locationReview = await db.location_scores.findUnique({
            where : {location_id:id}
        })

        

        if(!locationReview){
            return ctx.json({error:"Location not found"},404);
        }
        return ctx.json({locationReview},200);
    })

     

export default app;