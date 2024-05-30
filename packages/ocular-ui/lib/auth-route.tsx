import { GetSession } from "./auth";
import { ReactNode, useEffect } from "react";
import { useRouter } from 'next/router';

type AuthRouteProps = {
    children: ReactNode;
};

const AuthRoute = ({ children }: AuthRouteProps) => {
    const router = useRouter() 

    useEffect(() => {

        const checkAuthentication = async () => {

            const profile = await GetSession();

            if (profile) {
    
                router.push("/dashboard/search");
    
            } 

        }
        
        checkAuthentication();

    }, []);

    return <>{children}</>;

};

export default AuthRoute;