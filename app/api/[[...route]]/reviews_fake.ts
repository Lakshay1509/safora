import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { error } from "console";

const app = new Hono()

    .get("/reviews1/:id", async (ctx) => {
        const id = ctx.req.param("id");
       
        // const supabase = await createClient();
        // const {
        //   data: { user },
        //   error,
        // } = await supabase.auth.getUser();
    
        // if (error || !user) {
        //   return ctx.json({ error: "Unauthorized" }, 401);
        // }
    
        // Query reviews table directly
        
        const review = await db.fake_reviews.findUnique({
            where:{location_id:id},
            select:{review:true}
        })

        if(!review){
            return ctx.json({},500)
        }

        return ctx.json({review},200)
      });

export default app;

