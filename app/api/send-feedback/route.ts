import { db } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { FeedbackEmailTemplate } from "@/components/email/FeedbackEmailTemplate";
import { render } from '@react-email/render';
import { TempEmailTemplate } from "@/components/email/Temp";

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AUTOSEND_API_KEY = process.env.AUTOSEND_API_KEY;
const AUTOSEND_API_URL = 'https://api.autosend.com/v1/mails/bulk';




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

  if (!AUTOSEND_API_KEY) {
    return Response.json({ error: "AUTOSEND_API_KEY is missing" }, { status: 500 });
  }

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
    const subject = "Your referral rewards are ready";

    // Generate single HTML template (same for all users)
    const htmlContent = await render(
      TempEmailTemplate({
        firstName: "Reader",
        logoUrl: "https://www.safeornot.space/logo.avif",
        
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

    // Process users in chunks of 100 (Autosend batch limit)
    const userChunks = chunkArray(users, 100);
    const results = [];
    const failedEmails:FaileEmails[] = [];

    // console.log(`Processing ${users.length} users in ${userChunks.length} batches`);

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
            email: "lakshay@safeornot.space",
            name: "Lakshay Gupta"
          },
          subject: subject,
          html: htmlContent,
        };

        console.log(`Sending batch ${chunkIndex + 1}:`, {
          recipientCount: recipients.length,
          subject: subject,
          htmlLength: htmlContent.length,
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
          // All emails in batch succeeded
          console.log(`Batch ${chunkIndex + 1} sent successfully to ${chunk.length} users`);
          chunk.forEach((user) => {
            results.push({
              user: user.email,
              result: { success: true },
            });
          });
        }

        // Rate limiting: Wait 2 seconds between batches
        if (chunkIndex < userChunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
