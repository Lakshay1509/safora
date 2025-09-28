import { EmailTemplate } from "@/components/EmailTemplate";
import { db } from "@/lib/prisma";
import { Resend } from "resend";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

const truncateText = (text: string | null, wordLimit: number = 15): string => {
  if (!text) return "";
  const cleanText = text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanText.split(" ");
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(" ") + "...";
  }
  return cleanText;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await db.posts.findMany({
      where: { is_article: 0 },
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
      take: 3,
      orderBy: { created_at: "desc" },
    });

    const articles = await db.posts.findMany({
      where: { is_article: 1 },
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
      take: 2,
      orderBy: { created_at: "desc" },
    });

    const users = await db.public_users.findMany({
      where: { daily_digest: 1 },
      take: 80,
    });




    const allContent = [...articles, ...posts];

    const highlights = allContent.map((item) => ({
      title: item.heading,
      description: truncateText(item.body),
      link: item.is_article
        ? `https://safeornot.space/article/${item.id}/${item.slug}`
        : `https://safeornot.space/post/${item.id}/${item.slug}`,
      imageUrl: item.image_url || undefined,
    }));

    const batchSize = 2;
    const results = [];
    const failedEmails = [];

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      const emailPromises = batch.map((user) =>
        resend.emails
          .send({
            from: "SafeOrNot Daily Digest <noreply@safeornot.space>",
            to: [user.email],
            subject: `${allContent[0].heading} | ${allContent[0].users?.name || "SafeOrNot"}`,
            react: EmailTemplate({
              firstName: user.name,
              logoUrl: "https://safeornot.space/logo.avif",
              highlights: highlights,
            }),
          })
          .catch((error) => ({ error: error.message, user: user.email }))
      );

      try {
        const batchResults = await Promise.all(emailPromises);

        // Separate successful and failed emails
        batchResults.forEach((result, index) => {
          if (result.error) {
            failedEmails.push(result);
          } else {
            results.push({ user: batch[index].email, result });
          }
        });

        // Rate limiting: Wait 1 second between batches
        if (i + batchSize < users.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch ${i / batchSize + 1} failed:`, error);
        batch.forEach((user) =>
          failedEmails.push({ user: user.email, error: (error instanceof Error ? error.message : String(error)) })
        );
      }
    }

    return Response.json(
      {
        success: "Email sent successfully",
        sent: results.length,
        failed: failedEmails.length,
        total: users.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
