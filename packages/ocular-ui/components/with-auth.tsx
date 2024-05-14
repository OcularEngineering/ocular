import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth-context';

const withAuth = (WrappedComponent: any) => {
    // eslint-disable-next-line react/display-name
    return (props: any) => {
        const router = useRouter();
        const auth = useAuth();

        console.log("Auth: ", auth)

        useEffect(() => {
            if (!auth?.user) {
                router.replace('/sign-in');
            }
        }, [router, auth]);

        return auth?.user ? <WrappedComponent {...props} /> : null;
    };
};

export default withAuth;