import { Hono } from "hono";
import { db } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const app = new Hono()

.get("/sub_comment/:parentCommentID",async(ctx)=>{

  const id = ctx.req.param("parentCommentID");

  const sub_comment = await db.posts_comments.findMany({
    where:{parent_id:id},
    include:{
            users:{
              select:{
                name:true,
                profile_url:true
              }
            }
          }
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
      text: z.string().max(1500),
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
          const post = await db.posts.findUnique({
            where:{id:id},
            include:{
              users:{
                select:{
                  name:true,
                  id:true
                }
              }
            }
          })
          const userData = await db.public_users.findUnique({
            where:{id:user.id}
          })

          if(!userData || !post){
            return ctx.json({error : "Post or user not found"},500);
          }
          

          const notification = await db.notifications.create({
            data:{
              user_id:post?.users?.id,
              sender_id:userData?.id,
              text: `**${userData?.name}** commented on your post **${post?.heading}**`
            }
          })
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
    
          },
          
        })
    
        if(comment){

          const commentData = await db.posts_comments.findUnique({
            where:{id:parentCommentId},
            include:{
              users:{
                select:{
                  name:true,
                  id:true
                }
                
              },
              posts:{
                select:{
                  heading:true
                }
              }
            }
            
          })



          const userData = await db.public_users.findUnique({
            where:{id:user.id}
          })

          if(!commentData || !userData){
            return ctx.json({error:"Error finding comment or user"},500)
          }

          const notification = await db.notifications.create({
            data:{
              user_id:commentData?.users?.id,
              sender_id:user.id,
              text:`**${userData.name}** replied to your comment on post **${commentData.posts?.heading}**`
            }
          })

          return ctx.json({comment},200);
        }
    
        return ctx.json({error:"Error creating comment"},500)
    

  }

)
.delete(
  "/delete/:commentId",
  async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const commentId = ctx.req.param("commentId");

    // Check if comment exists and belongs to the user
    const comment = await db.posts_comments.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return ctx.json({ error: "Comment not found" }, 404);
    }

    if (comment.user_id !== user.id) {
      return ctx.json({ error: "Not authorized to delete this comment" }, 403);
    }

    // Delete the comment
    const deletedComment = await db.posts_comments.delete({
      where: { id: commentId }
    });

    if (deletedComment) {
      return ctx.json({ message: "Comment deleted successfully" }, 200);
    }

    return ctx.json({ error: "Error deleting comment" }, 500);
  }
)


export default app;
