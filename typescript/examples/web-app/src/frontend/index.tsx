/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
//import "@itwin/itwinui-react/styles.css";

(async () => {
    const redirectUrl = new URL(import.meta.env.IMJS_AUTHORIZATION_REDIRECT_URI!);
    if (redirectUrl.pathname === window.location.pathname) {
        BrowserAuthorizationClient.handleSignInCallback();
    } 
    else {
        const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
        root.render(
            <React.StrictMode>
                <App/>
            </React.StrictMode>
        );
    }
})();
