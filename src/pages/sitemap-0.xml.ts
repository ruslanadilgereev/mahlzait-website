import type { APIRoute } from "astro";
import { allEntries, renderUrlSet } from "../utils/sitemaps";

export const GET: APIRoute = async () =>
  new Response(renderUrlSet(allEntries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
