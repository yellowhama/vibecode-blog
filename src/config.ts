export const SITE = {
  website: "https://vibecode.town",
  author: "Hugh",
  profile: "https://github.com/yellowhama",
  desc: "Building with AI agents. No hype. Just what works.",
  title: "vibecode",
  ogImage: "vibecode-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 5,
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
    github: "https://github.com/yellowhama/musu-bee",
    docs: "https://musu.pro",
    pricing: "https://musu.pro/pricing",
    windowsDownload: "https://github.com/yellowhama/musu-bee/releases/latest",
  },
} as const;
