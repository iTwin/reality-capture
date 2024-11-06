/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { Viewer2D } from "./Viewer2D";
//import { Viewer3D } from "./Viewer3D";
import "./App.css";
import { Tab, Tabs } from "@itwin/itwinui-react";
import { Rds } from "./DataTransferTab";
import { Rdas } from "./RDASTab";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import { ContextCapture } from "./CCSTab";
import { Svg2D, Svg3D, SvgProcess, SvgRealityMesh, SvgUpload } from "@itwin/itwinui-icons-react";
import { ReferenceTableBrowser } from "@itwin/reality-data-transfer";

interface TabMenu {
    realityDataAccessClient: RealityDataAccessClient;
    authorizationClient: BrowserAuthorizationClient;
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

    const getTabs = () => {
        switch (tabIndex) {
        case 0:
            return <Rdas realityDataAccessClient={props.realityDataAccessClient} authorizationClient={props.authorizationClient}/>;
        case 1:
            return <ContextCapture realityDataAccessClient={props.realityDataAccessClient} authorizationClient={props.authorizationClient}/>;
        case 2:
            return <Rds referenceTable={referenceTable} authorizationClient={props.authorizationClient} onReferenceTableChanged={onReferenceTableChanged} 
                realityDataAccessClient={props.realityDataAccessClient} useReferenceTable={useReferenceTable} 
                onUseReferenceTableChanged={onUseReferenceTableChanged} />;
        case 3:
            return <Viewer2D realityDataAccessClient={props.realityDataAccessClient}/>;
        /*case 4:
            return <Viewer3D realityDataAccessClient={props.realityDataAccessClient} 
                authClient={props.authorizationClient}/>;*/
        default:
            return <Rdas realityDataAccessClient={props.realityDataAccessClient} authorizationClient={props.authorizationClient}/>;
        }
    };

    return(
        <Tabs
            orientation="horizontal"
            labels={[                
                <Tab key={0} label="RDAS" startIcon={<SvgProcess />} />,
                <Tab key={1} label="CCS" startIcon={<SvgRealityMesh />} />,
                <Tab key={2} label="Data Transfer" startIcon={<SvgUpload />} />,
                <Tab key={3} label="2D viewer" startIcon={<Svg2D />} />,
                //<Tab key={4} label="3D viewer" startIcon={<Svg3D />} />,
            ]}
            onTabSelected={setTabIndex}
            type="borderless">
            {getTabs()}
        </Tabs> 
    );
}