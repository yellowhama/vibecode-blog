export const SITE = {
  website: "https://vibecode.town",
  author: "Hama",
  profile: "https://github.com/yellowhama",
  desc: "AI-native development insights for vibe coders",
  title: "vibecode",
  ogImage: "vibecode-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "",
    url: "",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Seoul",
  links: {
    github: "https://github.com/yellowhama/Musu",
    docs: "https://github.com/yellowhama/Musu/tree/main/docs/product",
    pricing:
      "https://github.com/yellowhama/Musu/blob/main/docs/product/website-copy/pricing.md",
    windowsDownload: "https://github.com/yellowhama/Musu/releases/latest",
  },
} as const;
