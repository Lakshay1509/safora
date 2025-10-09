import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { JSDOM } from "jsdom";

const app = new Hono()
  .post(
    "/fetch",
    zValidator(
      "json",
      z.object({
        url: z.string().url(),
      })
    ),
    async (ctx) => {
      const { url } = ctx.req.valid("json");

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch URL");
        }

        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Extract Open Graph metadata
        const getMetaContent = (property: string) => {
          const element = document.querySelector(
            `meta[property="${property}"], meta[name="${property}"]`
          );
          return element?.getAttribute("content") || null;
        };

        const metadata = {
          title: getMetaContent("og:title") || document.title || null,
          description: getMetaContent("og:description") || getMetaContent("description") || null,
          image: getMetaContent("og:image") || null,
          url: getMetaContent("og:url") || url,
          siteName: getMetaContent("og:site_name") || null,
        };

        return ctx.json({ success: true, metadata }, 200);
      } catch (error) {
        console.error("Error fetching link preview:", error);
        return ctx.json({ success: false, error: "Failed to fetch preview" }, 500);
      }
    }
  );

export default app;