export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Ocular AI",
  description:
    "Ocular AI",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  links: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    docs: "",
    search: "/dashboard/search",
    settings: "/dashboard/settings",
    copilot: "/dashboard/copilot",
    apps: "/dashboard/apps",
    usage: "/dashboard/usage"
  },
}
