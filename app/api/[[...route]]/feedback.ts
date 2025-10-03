import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

const app = new Hono().post(
  "/add",
  zValidator(
    "json",
    z.object({
      rating: z.number().int().min(1).max(5),
      feedback: z.string().max(1500),
    })
  ),
  async (ctx) => {
    

    const values = ctx.req.valid("json");
    const url = `https://sheetdb.io/api/v1/${process.env.DB_SHEET}`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [
            {
              rating: values.rating,
              feedback: values.feedback,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`SheetDB API error: ${response.status}`);
      }

      const data = await response.json();

      return ctx.json(
        {
          success: true,
          message: "Feedback submitted successfully",
          data,
        },
        201
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return ctx.json(
        {
          success: false,
          error: "Failed to submit feedback",
        },
        500
      );
    }
  }
);

export default app;
