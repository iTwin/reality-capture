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

    const realityDataAccessClient = useMemo(
        (): RealityDataAccessClient => {
            let prefix = process.env.IMJS_URL_PREFIX ?? "";
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
        // Temporary fix (ResizeObserver - loop limit exceeded)
        class CalmResizeObserver extends ResizeObserver {
            constructor(callback: ResizeObserverCallback) {
                super((entries, observer) => {
                    requestAnimationFrame(() => {
                        callback(entries, observer);
                    });
                });
            }
        }
          
        window.ResizeObserver = CalmResizeObserver;

        void login();
    }, [login]);

    return(
        <div className="App">
            {!accessToken && (
                <div className="signin-content">
                    <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
                </div>
            )}
            {accessToken && (
                <TabMenu realityDataAccessClient={realityDataAccessClient} authorizationClient={authClient}/>
            )}
        </div>
    );
}