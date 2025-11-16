import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as cheerio from "cheerio";

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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch URL");
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract Open Graph metadata
        const getMetaContent = (property: string) => {
          return (
            $(`meta[property="${property}"]`).attr("content") ||
            $(`meta[name="${property}"]`).attr("content") ||
            null
          );
        };

        const metadata = {
          title: getMetaContent("og:title") || $("title").text() || null,
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
