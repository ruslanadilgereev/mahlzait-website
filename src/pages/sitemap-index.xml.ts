import type { APIRoute } from "astro";
import { renderSitemapIndex } from "../utils/sitemaps";

export const GET: APIRoute = async () =>
  new Response(renderSitemapIndex(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
