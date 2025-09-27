import { EmailTemplate } from "@/components/EmailTemplate";
import { db } from "@/lib/prisma";
import { Hono } from "hono";
import { Resend } from 'resend';
import * as React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

const truncateText = (text: string | null, wordLimit: number = 15): string => {
    if (!text) {
        return '';
    }
    // Remove HTML tags and extra whitespace
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return cleanText;
};


const app = new Hono()
    .post('/send-mail', async (ctx) => {
        const authHeader = ctx.req.header('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return ctx.json({ error: 'Unauthorized' }, 401);
        }

        const posts = await db.posts.findMany({
            where: { is_article: 0 },
            take: 3,
            orderBy: { created_at: 'desc' }
        });

        const articles = await db.posts.findMany({
            where: { is_article: 1 },
            take: 2,
            orderBy: {created_at: 'desc' }
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
                firstName: 'Lakshay', // Replace with dynamic user name
                logoUrl: 'https://safeornot.space/logo.avif',
                highlights: highlights
            }),
        });

        if (error) {
            console.error({ error });
            return ctx.json({ error: 'Failed to send email' }, 500);
        }

        return ctx.json({ message: 'Email sent successfully', data });
    });

export default app;