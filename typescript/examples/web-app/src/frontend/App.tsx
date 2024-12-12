/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect, useMemo } from "react";
import "./App.css";
import { ProgressLinear, ThemeProvider } from "@itwin/itwinui-react";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import { access } from "fs";
import { TabMenu } from "./TabMenu";

export function App() {
    const [accessToken, setAccessToken] = React.useState<string>();

    const authClient = useMemo(
        () =>
            new BrowserAuthorizationClient({
                scope: import.meta.env.IMJS_AUTHORIZATION_SCOPES ?? "",
                clientId: import.meta.env.IMJS_AUTHORIZATION_CLIENT_ID ?? "",
                redirectUri: import.meta.env.IMJS_AUTHORIZATION_REDIRECT_URI ?? "",
                responseType: "code",
                authority: import.meta.env.IMJS_AUTHORIZATION_ISSUER_URL,
            }),
        []
    );

    const realityDataAccessClient = useMemo(
        (): RealityDataAccessClient => {
            let prefix = import.meta.env.IMJS_URL_PREFIX ?? "";
            if(prefix === "dev-")
                prefix = "qa-";

            const realityDataClientOptions: RealityDataClientOptions = {
                baseUrl: "https://" + prefix + "api.bentley.com/reality-management",
                authorizationClient: authClient
            };
            return new RealityDataAccessClient(realityDataClientOptions);
        },[authClient],
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
                    <ThemeProvider theme="light">
                        <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
                    </ThemeProvider>
                </div>
            )}
            {accessToken && (
                <ThemeProvider theme="light">
                    <TabMenu realityDataAccessClient={realityDataAccessClient} authorizationClient={authClient}/>
                </ThemeProvider>
            )}
        </div>
    );
}