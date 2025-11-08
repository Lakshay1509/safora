import { Hono } from "hono";
import { handle } from "hono/vercel";
import location from "./location"
import comment from "./comment"
import user from "./user"
import review from "./review"
import post from "./post"
import post_comment from "./post-comments"
import community from './community'
import following from "./following"
import upvotes from './votes'
import article from './article'
import feedback from './feedback'
import linkPreview from './link-preview'
import cron from './cron'
import achievment from './achievment'
import upload from './upload'
import referral from './referral'

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const app = new Hono().basePath("/api");

const routes = app
    .route("/location",location)
    .route("/comment",comment)
    .route("/user",user)
    .route("/review",review)
    .route("/post",post)
    .route("/post_comments",post_comment)
    .route("/community",community)
    .route("/following",following)
    .route("/upvotes",upvotes)
    .route("/article",article)
    .route("/feedback",feedback)
    .route('/link-preview', linkPreview)
    .route('/cron',cron)
    .route('/achievment',achievment)
    .route('/upload',upload)
    .route('/referral',referral)

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;