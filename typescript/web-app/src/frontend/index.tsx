/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BrowserAuthorizationCallbackHandler } from "@itwin/browser-authorization";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

(async () => {
    const redirectUrl = new URL(process.env.IMJS_AUTHORIZATION_REDIRECT_URI!);
    if (redirectUrl.pathname === window.location.pathname) {
        BrowserAuthorizationCallbackHandler.handleSigninCallback(redirectUrl.toString());
    } 
    else {
        ReactDOM.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>,
            document.getElementById("root")       
        );
    }
})();
