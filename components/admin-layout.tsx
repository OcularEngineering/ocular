import { AdminNav } from "@/components/admin-nav";
import Head from 'next/head';
import { cn } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { ThemeProvider } from "@/components/theme-provider"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
            <div className="flex h-screen justify-center" style={{background: 'linear-gradient(to bottom, rgba(0, 0, 255, 0.01) 10%, transparent)'}}>
                <div className="border-default flex w-[240px] flex-col justify-between overflow-y-auto border-r bg-gray-100 dark:bg-transparent p-2">
                    <AdminNav />
                </div>
                <div className="grow justify-center overflow-auto">
                    <div className="flex items-center justify-center">
                    <div className="w-3/4">{children}</div> 
                    </div>
                </div>
            </div>
        </ThemeProvider>
    </>
  );
}