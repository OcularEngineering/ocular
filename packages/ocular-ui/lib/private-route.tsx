import { GetSession } from "./auth";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from 'next/router';

type PrivateRouteProps = {
    children: ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const router = useRouter() 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            const authenticated = await GetSession();
            setIsAuthenticated(authenticated);
            setLoading(false);
        };

        checkAuthentication();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {

        return <>{children}</>;

    } else {

        router.push("/sign-in");

        return null; 
    }
};

export default PrivateRoute;
