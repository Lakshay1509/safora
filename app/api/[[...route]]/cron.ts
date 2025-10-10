import { db } from "@/lib/prisma";
import { Hono } from "hono";

const app = new Hono()

app.get('/update-streak', async (ctx) => {
  const authHeader = ctx.req.header('x-authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return ctx.json({ error: 'Unauthorized' }, 401);
  }

  // Start of yesterday (streaks older than this are broken)
  const startOfYesterday = new Date();
  startOfYesterday.setUTCHours(0, 0, 0, 0);
  startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);

  // Reset streaks that are 2+ days old (missed yesterday entirely)
  const brokenStreaks = await db.streak.updateMany({
    where: {
      updated_at: {
        lt: startOfYesterday  // Not updated yesterday OR today
      }
    },
    data: {
      count: 0,
      active_today: false
    }
  });

  // Reset active_today flag for ALL users (new day starts)
  const resetFlags = await db.streak.updateMany({
    where: {
      active_today: true
    },
    data: {
      active_today: false
    }
  });

  return ctx.json({ 
    brokenStreaks: brokenStreaks.count,
    resetFlags: resetFlags.count 
  }, 200);
});



export default app;