import { SideNav } from "@/src/components/side-nav";
import { links } from "@/src/data/data";
import Head from 'next/head';
import { cn } from "@/src/lib/utils"
import { siteConfig } from "@/src/config/site"
import { fontSans } from "@/src/lib/fonts"
import { ThemeProvider } from "@/src/components/theme-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
            <div className="flex h-screen justify-center">
                <div className="border-default flex w-14 flex-col justify-between overflow-y-auto border-r bg-background p-2">
                    <SideNav
                        links={links}
                    />
                </div>
                <div className="grow justify-center overflow-auto">
                    <div className="flex items-center justify-center">
                    <div className="w-full">{children}</div> 
                    </div>
                </div>
            </div>
        </ThemeProvider>
    </>
  );
}