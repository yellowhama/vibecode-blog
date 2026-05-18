import { getCollection } from "astro:content";
import getSortedPosts from "@/utils/getSortedPosts";
import { getPath } from "@/utils/getPath";

export async function GET() {
  const posts = getSortedPosts(
    await getCollection("blog", ({ data }) => !data.draft)
  ).map(post => ({
    slug: getPath(post.id, post.filePath, false).replace(/^\//, ""),
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDatetime.toISOString(),
    series: post.data.series ?? null,
    tags: post.data.tags,
    ogImage: post.data.ogImage ?? null,
  }));

  return new Response(JSON.stringify({ posts }, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
