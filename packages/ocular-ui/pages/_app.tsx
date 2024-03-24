import "@/styles/globals.css"
import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { AppProps } from 'next/app';
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Layout from '@/components/layout';

NProgress.configure({
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

{/* Layouts */}
import DashboardLayout from '@/components/dashboard-layout';
import AuthLayout from '@/components/auth-layout';

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
    
    if (router.pathname.startsWith('/dashboard')) {

      return (page: ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
      
    } else if ((router.pathname.startsWith('/sign-in')) || (router.pathname.startsWith('/create-account')) || (router.pathname.startsWith('/invite'))) {

      return (page: ReactNode) => <AuthLayout>{page}</AuthLayout>;

    } else if (router.pathname.startsWith('/dashboard/search')){

      return (page: ReactNode) => <Layout>{page}</Layout>;
      
    }

    return (page: ReactNode) => page;
  };

  return getLayout()(<Component {...pageProps} />);
}

export default MyApp;
