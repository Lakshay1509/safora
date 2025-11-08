import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";

// Function to generate a random 6-character alphanumeric code
function generateReferralCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Function to generate a unique referral code
async function generateUniqueCode(): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateReferralCode();
    const existingCode = await db.referal.findUnique({
      where: { code },
    });

    if (!existingCode) {
      isUnique = true;
      return code;
    }
    attempts++;
  }

  throw new Error("Failed to generate unique code");
}

const app = new Hono()
  .get("/create", async (ctx) => {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const code = await db.referal.findUnique({
      where: {
        user_id: user.id,
      },
    });

    if (code) {
      return ctx.json(
        {
          data: {
            ...code,
            id: code.id.toString(),
          },
        },
        200
      );
    }

    try {
      const uniqueCode = await generateUniqueCode();
      const data = await db.referal.create({
        data: {
          user_id: user.id,
          code: uniqueCode,
        },
      });

      return ctx.json(
        {
          data: {
            ...data,
            id: data.id.toString(),
          },
        },
        200
      );
    } catch (error) {
      return ctx.json({ error: "Error creating code" }, 500);
    }
  })

  .post(
    "/add",
    zValidator(
      "json",
      z.object({
        code: z.string(),
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

      const values = ctx.req.valid("json");

      const codeData = await db.referal.findUnique({
        where: {
          code: values.code,
        },
      });

      if (!codeData) {
        return ctx.json({ error: "No code exist" }, 404);
      }

      if (codeData.user_id === user.id) {
        return ctx.json({ error: "Cannot use your own referral code" }, 400);
      }

      // Check if referral already exists
      const findData = await db.referal_analytics.findUnique({
        where: {
          user_id: user.id,
        },
      });

      if (findData) {
        return ctx.json({ error: "Referral already applied" }, 400);
      }

      // Create the referral analytics record
      try {
        const analytics = await db.referal_analytics.create({
          data: {
            user_id: user.id,
            referee_id: codeData.user_id,
            created_at: new Date(),
          },
        });

        return ctx.json(
          {
            data: {
              user_id: analytics.user_id,
              referee_id: analytics.referee_id,
              created_at: analytics.created_at,
            },
            message: "Referral applied successfully",
          },
          200
        );
      } catch (error) {
        console.error("Error adding referral:", error);
        return ctx.json({ error: "Error adding referral" }, 500);
      }
    }
  )

  .get("/leaderboard", async (ctx) => {
    // Get the start and end of the current month in UTC
    const now = new Date();

    // Start of current month in UTC
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
    );

    // End of current month in UTC (day 0 of next month = last day of current month)
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );

  

    try {
      // Get referral counts grouped by referee_id for the current month
      const leaderboard = await db.referal_analytics.groupBy({
        by: ["referee_id"],
        where: {
          created_at: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _count: {
          referee_id: true,
        },
        orderBy: {
          _count: {
            referee_id: "desc",
          },
        },
        take: 20,
      });

      // Get referee details for each entry
      const leaderboardWithDetails = await Promise.all(
        leaderboard.map(async (entry) => {
          const user = await db.public_users.findUnique({
            where: {
              id: entry.referee_id,
            },
            select: {
              name: true,
              profile_url: true,
            },
          });

          return {
            user_id: entry.referee_id,
            name: user?.name || "Unknown User",
            url: user?.profile_url || "",
            referral_count: entry._count.referee_id,
          };
        })
      );

      return ctx.json(
        {
          data: leaderboardWithDetails,
          period: {
            start: startOfMonth.toISOString(),
            end: endOfMonth.toISOString(),
          },
        },
        200
      );
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return ctx.json({ error: "Error fetching leaderboard" }, 500);
    }
  });

export default app;
