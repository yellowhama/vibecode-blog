import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ url }) => {
  const action = url.searchParams.get("action") || "list_posts";
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => new Date(b.data.pubDatetime).getTime() - new Date(a.data.pubDatetime).getTime());

  if (action === "list_posts") {
    return new Response(JSON.stringify({ posts: sorted.map(p => ({ slug: p.id, title: p.data.title, description: p.data.description, pubDate: p.data.pubDatetime, tags: p.data.tags })) }), { headers: { "Content-Type": "application/json" } });
  }
  if (action === "read_post") {
    const slug = url.searchParams.get("slug") || "";
    const post = posts.find(p => p.id === slug || p.id.includes(slug));
    if (!post) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ slug: post.id, title: post.data.title, content: post.body }), { headers: { "Content-Type": "application/json" } });
  }
  if (action === "search_posts") {
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const results = sorted.filter(p => p.data.title.toLowerCase().includes(q) || p.data.description.toLowerCase().includes(q) || (p.body && p.body.toLowerCase().includes(q)));
    return new Response(JSON.stringify({ results: results.map(p => ({ slug: p.id, title: p.data.title, description: p.data.description })) }), { headers: { "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { "Content-Type": "application/json" } });
};
