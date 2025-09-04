import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const app = new Hono()

.get("/sub_comment/:parentCommentID",async(ctx)=>{

  const id = ctx.req.param("parentCommentID");

  const sub_comment = await db.posts_comments.findMany({
    where:{parent_id:id}
  })

  if(!sub_comment){
    return ctx.json({error:"Error getting sub-comments"},500);
  }

  return ctx.json({sub_comment},200)


})

.post(
  "/add/:id",
  zValidator(
    "json",
    z.object({
      text: z.string().max(500),
    })
  ),
  async (ctx) => {


        const supabase = await createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
    
        if (error || !user) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }
        
        const id = ctx.req.param("id");
        const values = ctx.req.valid("json");
    
        const comment = await db.posts_comments.create({
          data:{
            ...values,
            user_id:user.id,
            post_id:id

    
          }
        })
    
        if(comment){
          return ctx.json({comment},200);
        }
    
        return ctx.json({error:"Error creating comment"},500)
    

  }
)

.post(
  "/sub_comment/add/:postId/:parentCommentId",
  zValidator(
    "json",
    z.object({
      text: z.string().max(500),
    })
  ),
  async (ctx) => {


        const supabase = await createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
    
        if (error || !user) {
          return ctx.json({ error: "Unauthorized" }, 401);
        }
        
        const post_id = ctx.req.param("postId");
        const parentCommentId = ctx.req.param("parentCommentId")
        const values = ctx.req.valid("json");

    
    
        const comment = await db.posts_comments.create({
          data:{
            ...values,
            user_id:user.id,
            post_id:post_id,
            parent_id:parentCommentId
    
          }
        })
    
        if(comment){
          return ctx.json({comment},200);
        }
    
        return ctx.json({error:"Error creating comment"},500)
    

  }
)


export default app;
