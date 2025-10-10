import cloudinaryService from "@/lib/cloudinary-service";
import { db } from "@/lib/prisma";
import { generateSlug } from "@/utils/slug";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

const app = new Hono()

    .post(
    "/add",
    zValidator(
      "form",
      z.object({
        heading: z.string().min(10).max(250),
        body: z.string().min(10).max(15000),
        image: z.preprocess(
          (arg) => (arg instanceof File && arg.size > 0 ? arg : undefined),
          z.instanceof(File).optional()
        ),
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

      const values = ctx.req.valid("form");
      const file = values.image;

      let imageUrl: string | undefined;

      if (file && file instanceof File && file.size > 0) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);

          const uploadResult = await cloudinaryService.uploadPostImage(
            buffer,
            user.id
          );
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return ctx.json({ error: "Image upload failed" }, 500);
        }
      }
      

      const article = await db.posts.create({
        data: {
          heading:values.heading,
          body:values.body,
          user_id: user.id,
          slug: generateSlug(values.heading),
          image_url: imageUrl,
          is_article:1
        },
      });

      if (article) {
        await db.streak.updateMany({
          where: {
            user_id: user.id,
            updated_at: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          data: {
            count: {
              increment: 1,
            },
            updated_at: new Date().toISOString(),
          },
        });
        return ctx.json({ article }, 200);
      }

      return ctx.json({ error: "Error creating post" }, 500);
    }
  )
  .put(
    "/update/:id",
    zValidator(
      "form",
      z.object({
        heading: z.string().min(10).max(250),
        body: z.string().min(10),
        image: z.preprocess(
          (arg) => (arg instanceof File && arg.size > 0 ? arg : undefined),
          z.instanceof(File).optional()
        ),
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
      const values = ctx.req.valid("form");
      const file = values.image;

      let imageUrl: string | undefined;

      if (file && file instanceof File && file.size > 0) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);

          const uploadResult = await cloudinaryService.uploadPostImage(
            buffer,
            user.id
          );
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return ctx.json({ error: "Image upload failed" }, 500);
        }
      }
      

      const article = await db.posts.update({
        where:{id:id},
        data: {
          heading:values.heading,
          body:values.body,
          user_id: user.id,
          slug: generateSlug(values.heading),
          ...(imageUrl && { image_url: imageUrl }),
          is_article:1
        },
      });

      if (article) {
        return ctx.json({ article }, 200);
      }

      return ctx.json({ error: "Error creating post" }, 500);
    }
  )
  .delete("/delete/:id", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }
    const id = ctx.req.param("id");

    const find_post = await db.posts.findUnique({
      where: { id: id },
    });

    if (!find_post) {
      return ctx.json({ error: "No post found" }, 500);
    }

    if (find_post.user_id !== user.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const post = await db.posts.delete({
      where: {
        id: id,
      },
    });

    if (!post) {
      return ctx.json({ error: "Error updating post" }, 500);
    }

    return ctx.json({ post }, 200);
  })
  .post('/upload-image',zValidator(
    "form",
    z.object({
      image:z.instanceof(File).optional(),
    })
  ),

  async(ctx)=>{
    const supabase = await createClient();
    const {
        data: { user },
        error,
      } = await supabase.auth.getUser();


      if (error || !user) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const values = ctx.req.valid("form");
      const file = values.image;

      let imageUrl: string | undefined;

      if (file && file instanceof File && file.size > 0) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);

          const uploadResult = await cloudinaryService.uploadPostImage(
            buffer,
            user.id
          );
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return ctx.json({ error: "Image upload failed" }, 500);
        }
      }

      if(imageUrl){
        return ctx.json({imageUrl},200)
      }
      return ctx.json({error:"Error uplaoding image"},500)
    
  }
)
export default app;