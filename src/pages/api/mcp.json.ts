import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => new Date(b.data.pubDatetime).getTime() - new Date(a.data.pubDatetime).getTime());
  
  const data = {
    posts: sorted.map(p => ({
      slug: p.id,
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDatetime,
      tags: p.data.tags,
    })),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
