import { Hono } from "hono";
import { handle } from "hono/vercel";
import location from "./location"
import comment from "./comment"

export const runtime = "nodejs";
const app = new Hono().basePath("/api");

const routes = app
    .route("/location",location)
    .route("/comment",comment);



export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;