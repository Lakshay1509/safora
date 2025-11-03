import { db } from "@/lib/prisma";
import { Resend } from "resend";
import { NextRequest } from "next/server";
import { FeedbackEmailTemplate } from "@/components/FeedbackEmailTemplate";

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

let resendClient: Resend | null = null

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is missing')
  if (!resendClient) resendClient = new Resend(key)
  return resendClient
}



type FaileEmails={
  user:string,
  error:string
}

// Helper function to chunk users into groups of 100
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

  const resend = getResend()

  try {
    // Optimize database queries with Promise.all for parallel execution
    const [users] = await Promise.all([
      // Remove the limit of 80 users - process all users with digest enabled
      db.public_users.findMany({
        where:{daily_digest:1},
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
    ]);

   

    // Subject line for all emails
    const subject = "What should we build next?";

    // Process users in chunks of 100 (Resend batch limit)
    const userChunks = chunkArray(users, 80);
    const results = [];
    const failedEmails:FaileEmails[] = [];

    // console.log(`Processing ${users.length} users in ${userChunks.length} batches`);

    for (let chunkIndex = 0; chunkIndex < userChunks.length; chunkIndex++) {
      const chunk = userChunks[chunkIndex];
      
      try {
        // Prepare batch emails for this chunk
        const batchEmails = chunk.map((user) => ({
          from: "Lakshay Gupta (Safe or Not) <hello@safeornot.space>",
          to: [user.email],
          subject: subject,
          react: FeedbackEmailTemplate({
            firstName: user.name,
            logoUrl: "https://www.safeornot.space/logo.avif",
            feedbackLink:"https://www.safeornot.space/feedback"
          }),
        }));

        // Send batch using Resend's batch API
        const batchResult = await resend.batch.send(batchEmails);

        if (batchResult.error) {
          console.error(`Batch ${chunkIndex + 1} failed:`, batchResult.error);
          // Add all users in this batch to failed emails
          chunk.forEach((user) =>
            failedEmails.push({ 
              user: user.email, 
              error: batchResult.error?.message || "Batch send failed" 
            })
          );
        } else {
          // All emails in batch succeeded
          console.log(`Batch ${chunkIndex + 1} sent successfully to ${chunk.length} users`);
          chunk.forEach((user, index) => {
            results.push({
              user: user.email,
              result: batchResult.data?.[index] || { success: true },
            });
          });
        }

        // Rate limiting: Wait 1 second between batches (Resend allows 2 requests/second)
        if (chunkIndex < userChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch ${chunkIndex + 1} failed with exception:`, error);
        // Add all users in this batch to failed emails
        chunk.forEach((user) =>
          failedEmails.push({
            user: user.email,
            error: error instanceof Error ? error.message : String(error),
          })
        );
      }
    }

    // Log detailed results
    // console.log(`Email digest completed: ${results.length} sent, ${failedEmails.length} failed`);
    
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
