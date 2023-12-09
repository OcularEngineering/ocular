import {useGetAppsQuery} from "./services/apps";

import * as React from 'react';
import {Link, Route, Routes} from 'react-router-dom';
import {DynamicComponent} from "../components/dynamic/DynamicComponent";
import {environment} from "../../environments/environment";


export const AppsList = () => {
    const { data: apps, error, isLoading } = useGetAppsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>error</div>;
    }
  return (
    <React.Suspense fallback={null}>
            <header style={{display:'inline-block'}}>
            <div>
                <h1>Apps List</h1>
                {apps?.map((app:any,index:any) => (
                    <li key={index}>
                        <Link to={app}>{app}</Link>
                    </li>
                ))}
            </div>
            </header>
            <Routes>
               {apps?.map((app:any,index:any) => (
                    <Route path={app} element={<DynamicComponent url={`${environment.appServerUrl}/apps/${app}/remoteEntry.js`}  scope="core-ui" module="./Module"/>} />
                ))}
            </Routes>

    </React.Suspense>
  );
}