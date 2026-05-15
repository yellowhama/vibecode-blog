import type { APIRoute } from "astro";
import { SITE } from "@/config";

const sitemapIndex = (site: string) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${new URL("sitemap-0.xml", site).href}</loc>
  </sitemap>
</sitemapindex>
`;

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapIndex(site?.href ?? SITE.website), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
