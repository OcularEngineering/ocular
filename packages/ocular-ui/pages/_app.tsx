import "@/styles/globals.css";
import "nprogress/nprogress.css";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { AppProps } from "next/app";
import NProgress from "nprogress";
import Layout from "@/components/layout";
import DashboardLayout from "@/components/dashboard-layout";
import AuthLayout from "@/components/auth-layout";
import ChatLayout from "@/components/chat-layout";
import MarketplaceLayout from "@/components/marketplace/marketplace-layout";
import PrivateRoute from "@/lib/private-route";
import AuthRoute from "@/lib/auth-route";

NProgress.configure({
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const start = () => {
      NProgress.start();
    };
    const end = () => {
      NProgress.done();
    };
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };
  }, [router.events]);

  const getLayout = () => {
    if (router.pathname.startsWith("/dashboard")) {

      if (router.pathname.startsWith("/dashboard/marketplace")) {

        // eslint-disable-next-line react/display-name
        return (page: ReactNode) => (
          <DashboardLayout>
            <PrivateRoute>
              <MarketplaceLayout>{page}</MarketplaceLayout>
            </PrivateRoute>
          </DashboardLayout>
        );
      }

      // eslint-disable-next-line react/display-name
      return (page: ReactNode) => (
        <DashboardLayout>
          <PrivateRoute>{page}</PrivateRoute>
        </DashboardLayout>
      );
    } else if (
      router.pathname.startsWith("/sign-in") ||
      router.pathname.startsWith("/create-account") ||
      router.pathname.startsWith("/invite")
    ) {

      // eslint-disable-next-line react/display-name
      return (page: ReactNode) => (
        <AuthLayout>
          <AuthRoute>{page}</AuthRoute>
        </AuthLayout>
      );

    } else if (router.pathname.startsWith("/dashboard/search")) {

      // eslint-disable-next-line react/display-name
      return (page: ReactNode) => <Layout>{page}</Layout>;

    } else if (router.pathname.includes("/dashboard/chat")) {

      // eslint-disable-next-line react/display-name
      return (page: ReactNode) => <ChatLayout>{page}</ChatLayout>;
    }

    return (page: ReactNode) => page;
  };

  return getLayout()(<Component {...pageProps} />);
}

export default MyApp;
