import type { APIRoute } from "astro";
import { renderUrlSet, segmentedSitemaps } from "../../utils/sitemaps";

export const GET: APIRoute = async () =>
  new Response(renderUrlSet(segmentedSitemaps.find((sitemap) => sitemap.slug === "foods")!.entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
