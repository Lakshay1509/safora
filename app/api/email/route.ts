
import { EmailTemplate } from "@/components/EmailTemplate";
import { db } from "@/lib/prisma";
import { Resend } from 'resend';
import { NextRequest } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

const truncateText = (text: string | null, wordLimit: number = 15): string => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return cleanText;
};

export async function GET(request: NextRequest) {
    console.log('Headers as object:', Object.fromEntries(request.headers.entries()));
    const authHeader = request.headers.get("x-authorization");

    console.log('Expected:', process.env.CRON_SECRET);
    console.log('Received:', authHeader);
    console.log(authHeader === `Bearer ${process.env.CRON_SECRET}`)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const posts = await db.posts.findMany({
            where: { is_article: 0 },
            take: 3,
            orderBy: { created_at: 'desc' }
        });

        const articles = await db.posts.findMany({
            where: { is_article: 1 },
            take: 2,
            orderBy: { created_at: 'desc' }
        });

        const allContent = [...articles, ...posts];

        const highlights = allContent.map(item => ({
            title: item.heading,
            description: truncateText(item.body),
            link: item.is_article
                ? `https://safeornot.space/article/${item.id}/${item.slug}`
                : `https://safeornot.space/post/${item.id}/${item.slug}`,
            imageUrl: item.image_url || undefined,
        }));

        const { data, error } = await resend.emails.send({
            from: 'SafeOrNot <noreply@safeornot.space>',
            to: ['gupta15.lakshay@gmail.com'],
            subject: 'Your Daily Digest from Safe or Not',
            react: EmailTemplate({
                firstName: 'Lakshay',
                logoUrl: 'https://safeornot.space/logo.avif',
                highlights: highlights
            }),
        });

        if (error) {
            console.error({ error });
            return Response.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return Response.json({ message: 'Email sent successfully', data });
    } catch (error) {
        console.error('Cron job error:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
