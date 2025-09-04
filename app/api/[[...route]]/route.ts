import { Hono } from "hono";
import { handle } from "hono/vercel";
import location from "./location"
import comment from "./comment"
import user from "./user"
import review from "./review"
import review1 from "./reviews_fake"
import post from "./post"
import post_comment from "./post-comments"

export const runtime = "nodejs";
const app = new Hono().basePath("/api");

const routes = app
    .route("/location",location)
    .route("/comment",comment)
    .route("/user",user)
    .route("/review",review)
    .route("/review1",review1)
    .route("post",post)
    .route("post_comments",post_comment)



export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;