export const SITE = {
  website: "https://vibecode.town",
  author: "Hugh",
  profile: "https://github.com/yellowhama",
  desc: "Vibe coding in practice. What works, what breaks, what I learned.",
  title: "vibecode",
  ogImage: "vibecode-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 5,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Edit on GitHub",
    url: "https://github.com/yellowhama/vibecode-blog/edit/main/src/data/blog",
  },
  dynamicOgImage: false, // disabled: Vercel free tier OOM with satori+resvg
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Seoul",
  links: {
    github: "https://github.com/yellowhama/vibecode-blog",
    docs: "https://vibecode.town/structure",
    pricing: "https://vibecode.town",
    windowsDownload: "https://vibecode.town",
  },
} as const;
