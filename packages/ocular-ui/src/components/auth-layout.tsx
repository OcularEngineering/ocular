import { Metadata } from "next"
import { siteConfig } from "@/src/config/site"
import { fontSans } from "@/src/lib/fonts"
import { cn } from "@/src/lib/utils"
import { ThemeProvider } from "@/src/components/theme-provider"
import { RootLayoutProps } from "@/src/types/types"
import Head from 'next/head';

export const viewport: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "./Ocular-Profile-Logo.png",
    shortcut: "./Ocular-Profile-Logo.png",
    apple: "./Ocular-Profile-Logo.png",
  },
}

export default function AuthLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <link rel="icon" href="./Ocular-Profile-Logo.png" />
        <body
          className={cn(
            "bg-background min-h-screen font-sans antialiased",
            fontSans.variable
          )}
        />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="relative flex min-h-screen w-screen flex-col">
          <div className="min-h-screen w-screen flex-1">{children}</div>
        </div>
      </ThemeProvider>
    </>
  )
}