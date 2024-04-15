import { SideNav } from "@/components/side-nav";
import { links } from "@/data/data";
import Head from 'next/head';
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalState } from "@/lib/global-state";

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
        <GlobalState>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="flex h-screen justify-center">
                    <div className="border-default flex w-14 flex-col justify-between overflow-y-auto border-r bg-background p-2">
                        <SideNav
                            links={links}
                        />
                    </div>
                    <div className="grow justify-center overflow-auto">
                        {/* <div className="flex-row items-center justify-center"> */}
                        <div className="w-full-14">{children}</div> 
                        {/* </div> */}
                    </div>
                </div>
            </ThemeProvider>
        </GlobalState> 
    </>
  );
}