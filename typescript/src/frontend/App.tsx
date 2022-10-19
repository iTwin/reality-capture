/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useMemo } from "react";
import "./App.css";
import { ProgressLinear } from "@itwin/itwinui-react";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import { TabMenu } from "./TabMenu";

export function App() {
    const [accessToken, setAccessToken] = React.useState<string>();

    const realityDataAccessClient = useMemo(
        (): RealityDataAccessClient => {
            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
            };
            return new RealityDataAccessClient(realityDataClientOptions);
        },[],
    );

    const authClient = useMemo(
        () =>
            new BrowserAuthorizationClient({
                scope: process.env.IMJS_AUTHORIZATION_SCOPES ?? "",
                clientId: process.env.IMJS_AUTHORIZATION_CLIENT_ID ?? "",
                redirectUri: process.env.IMJS_AUTHORIZATION_REDIRECT_URI ?? "",
                responseType: "code",
                authority: process.env.IMJS_AUTHORIZATION_ISSUER_URL,
            }),
        []
    );
    
    const login = useCallback(async () => {
        try {
            await authClient.signInSilent();            
        } catch {
            await authClient.signIn();           
        }
        setAccessToken(await authClient.getAccessToken());
    }, [authClient]);
    
    useEffect(() => {
        void login();
    }, [login]);

    return(
        <div className="App">
            {!accessToken && (
                <div className="signin-content">
                    <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
                </div>
            )}
            <TabMenu accessToken={accessToken!} realityDataAccessClient={realityDataAccessClient} authClient={authClient}/>
        </div>
    );
}