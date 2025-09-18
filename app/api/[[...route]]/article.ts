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
        body: z.string().min(10),
        image: z.instanceof(File).optional(),
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
      console.log(imageUrl)

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
        return ctx.json({ article }, 200);
      }

      return ctx.json({ error: "Error creating post" }, 500);
    }
  )
export default app;