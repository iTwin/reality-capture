/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useMemo } from "react";
import { Viewer2D } from "./Viewer2D";
import { Viewer3D } from "./Viewer3D";
import "./App.css";
import { HorizontalTabs, Tab } from "@itwin/itwinui-react";
import { Rds } from "./DataTransferTab";
import { Rdas } from "./RDASTab";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import { ContextCapture } from "./CCSTab";
import { ReferenceTableBrowser } from "./sdk/utils/ReferenceTableBrowser";
import { Svg2D, Svg3D, SvgProcess, SvgRealityMesh, SvgUpload } from "@itwin/itwinui-icons-react";
import { ClientInfo } from "./sdk/CommonData";
import { RealityDataAnalysisService } from "./sdk/rdas/RealityDataAnalysisService";
import { ContextCaptureService } from "./sdk/cccs/ContextCaptureService";
import { RealityDataTransferBrowser } from "./sdk/utils/RealityDataTransferBrowser";

interface TabMenu {
    realityDataAccessClient: RealityDataAccessClient;
    authClient: BrowserAuthorizationClient;
}

export function TabMenu(props: TabMenu) {
    const [tabIndex, setTabIndex] = React.useState(0);
    const [referenceTable, setReferenceTable] = React.useState(new ReferenceTableBrowser());
    const [useReferenceTable, setUseReferenceTable] = React.useState(true);

    const onReferenceTableChanged = async (newReferenceTable: ReferenceTableBrowser): Promise<void> => {
        setReferenceTable(newReferenceTable);
    };

    const onUseReferenceTableChanged = async (isUsed: boolean): Promise<void> => {
        setUseReferenceTable(isUsed);
    };

    const clientInfo = useMemo(
        (): ClientInfo => {
            const clientInfo: ClientInfo = {clientId: process.env.REACT_APP_AUTHORIZATION_CLIENT_ID!, 
                scopes: new Set([...RealityDataAnalysisService.getScopes(), ...ContextCaptureService.getScopes(), ...RealityDataTransferBrowser.getScopes()]), 
                env: "qa-", redirectUrl: process.env.REACT_APP_AUTHORIZATION_REDIRECT_URI!};
            return clientInfo;
        },[],
    );

    const getTabs = () => {
        switch (tabIndex) {
        case 0:
            return <Rdas realityDataAccessClient={props.realityDataAccessClient} clientInfo={clientInfo}/>;
        case 1:
            return <ContextCapture realityDataAccessClient={props.realityDataAccessClient} clientInfo={clientInfo}/>;
        case 2:
            return <Viewer2D realityDataAccessClient={props.realityDataAccessClient}/>;
        case 3:
            return <Viewer3D realityDataAccessClient={props.realityDataAccessClient} 
                authClient={props.authClient}/>;
        case 4:
            return <Rds referenceTable={referenceTable} clientInfo={clientInfo} onReferenceTableChanged={onReferenceTableChanged} 
                realityDataAccessClient={props.realityDataAccessClient} useReferenceTable={useReferenceTable} 
                onUseReferenceTableChanged={onUseReferenceTableChanged} />;
        default:
            return <Rdas realityDataAccessClient={props.realityDataAccessClient} clientInfo={clientInfo}/>;
        }
    };

    return(
        <HorizontalTabs
            labels={[                
                <Tab key={0} label="RDAS" startIcon={<SvgProcess />} />,
                <Tab key={1} label="CCS" startIcon={<SvgRealityMesh />} />,
                <Tab key={2} label="2D viewer" startIcon={<Svg2D />} />,
                <Tab key={3} label="3D viewer" startIcon={<Svg3D />} />,
                <Tab key={4} label="Data Transfer" startIcon={<SvgUpload />} />,
            ]}
            onTabSelected={setTabIndex}
            type="borderless">
            {getTabs()}
        </HorizontalTabs> 
    );
}