import { Hono } from "hono";
import { createClient } from "@/utils/supabase/server";
import cloudinaryService from "@/lib/cloudinary-service";

const app = new Hono()
  .get("/signature", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    // Generate signature for secure upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinaryService.generateSignature(timestamp, user.id);

    return ctx.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: `posts/${user.id}`,
    }, 200);
  });

export default app;