import { EmailTemplate } from "@/components/email/EmailTemplate";
import { db } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { render } from '@react-email/render';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AUTOSEND_API_KEY = process.env.AUTOSEND_API_KEY;
const AUTOSEND_API_URL = 'https://api.autosend.com/v1/mails/bulk';

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

type FailedEmails = {
  user: string,
  error: string
}

// Helper function to chunk users into groups (max 100 per Autosend request)
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!AUTOSEND_API_KEY) {
    return Response.json({ error: "AUTOSEND_API_KEY is missing" }, { status: 500 });
  }

  try {
    const [posts, articles, users] = await Promise.all([
      db.posts.findMany({
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
      }),
      db.posts.findMany({
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
      }),
      db.public_users.findMany({
        where: { daily_digest: 1 },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

    const allContent = [...articles, ...posts];

    const highlights = allContent.map((item) => ({
      title: item.heading,
      description: truncateText(item.body),
      link: item.is_article
        ? `https://www.safeornot.space/article/${item.id}/${item.slug}`
        : `https://www.safeornot.space/post/${item.id}/${item.slug}`,
      imageUrl: item.image_url || undefined,
    }));

    const subject = `${allContent[0]?.heading || "SafeOrNot Daily Digest"} | ${
      allContent[0]?.users?.name || "SafeOrNot"
    }`;

    // Generate single HTML template (same for all users)
    // Ensure it returns a string, not a React element
    const htmlContent = await render(
      EmailTemplate({
        firstName: "Reader",
        logoUrl: "https://www.safeornot.space/logo.avif",
        highlights: highlights,
      }),
      {
        pretty: false,
      }
    );

    // Verify HTML is a valid string
    if (typeof htmlContent !== 'string' || !htmlContent.trim()) {
      console.error('HTML content is not a valid string:', typeof htmlContent);
      return Response.json({ 
        error: "Failed to generate email HTML content" 
      }, { status: 500 });
    }

    console.log('Generated HTML length:', htmlContent.length);

    // Process users in chunks of 100 (Autosend's max limit)
    const userChunks = chunkArray(users, 100);
    const results = [];
    const failedEmails: FailedEmails[] = [];

    for (let chunkIndex = 0; chunkIndex < userChunks.length; chunkIndex++) {
      const chunk = userChunks[chunkIndex];
      
      try {
        // Prepare recipients array (only email and name, no individual HTML)
        const recipients = chunk.map((user) => ({
          email: user.email,
          name: user.name || user.email.split('@')[0], // Fallback if name is null/empty
        }));

        // Prepare request payload
        const payload = {
          recipients: recipients,
          from: {
            email: "noreply@safeornot.space",
            name: "SafeOrNot Daily Digest"
          },
          subject: subject,
          html: htmlContent,
        };

        console.log(`Sending batch ${chunkIndex + 1}:`, {
          recipientCount: recipients.length,
          subject: subject,
          htmlLength: htmlContent.length,
          htmlType: typeof htmlContent,
          htmlPreview: htmlContent.substring(0, 100),
          sampleRecipient: recipients[0]
        });

        // Send bulk email using Autosend API
        const response = await fetch(AUTOSEND_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTOSEND_API_KEY}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(`Batch ${chunkIndex + 1} failed:`, {
            status: response.status,
            statusText: response.statusText,
            error: result,
            validationDetails: result.error?.details
          });
          
          chunk.forEach((user) =>
            failedEmails.push({ 
              user: user.email, 
              error: JSON.stringify(result.error?.details) || result.message || "Bulk send failed" 
            })
          );
        } else {
          console.log(`Batch ${chunkIndex + 1} sent successfully to ${chunk.length} users`);
          chunk.forEach((user) => {
            results.push({
              user: user.email,
              result: { success: true },
            });
          });
        }

        // Rate limiting: Wait 2 second between batches
        if (chunkIndex < userChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Batch ${chunkIndex + 1} failed with exception:`, error);
        chunk.forEach((user) =>
          failedEmails.push({
            user: user.email,
            error: error instanceof Error ? error.message : String(error),
          })
        );
      }
    }

    if (failedEmails.length > 0) {
      console.error("Failed emails:", failedEmails);
    }

    return Response.json(
      {
        success: "Email digest completed",
        sent: results.length,
        failed: failedEmails.length,
        total: users.length,
        batches_processed: userChunks.length,
        failed_emails: failedEmails.length > 0 ? failedEmails : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
