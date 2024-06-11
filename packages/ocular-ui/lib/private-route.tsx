import { GetSession } from "./auth";
import { ReactNode, useEffect, useState, useContext } from "react";
import { useRouter } from 'next/router';
import { ApplicationContext } from "@/context/context"

type PrivateRouteProps = {
    children: ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const router = useRouter() 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const { setProfile } = useContext(ApplicationContext);

    useEffect(() => {
        const checkAuthentication = async () => {

            const profile = await GetSession();

            if (profile) {

                setIsAuthenticated(true);
                setProfile(profile);

            }
            setLoading(false);
        };

        checkAuthentication();
    }, []);

    if (loading) {

        return <div>Loading...</div>; // Need an actual loading spinner here   

    }

    if (isAuthenticated) {

        return <>{children}</>;

    } else {

        router.push("/sign-in");

        return null; 
    }
};

export default PrivateRoute;
