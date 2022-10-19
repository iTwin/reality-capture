/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { Viewer2D } from "./Viewer2D";
import { Viewer3D } from "./Viewer3D";
import "./App.css";
import { HorizontalTabs, Tab } from "@itwin/itwinui-react";
import { Rds } from "./DataTransferTab";
import { Rdas } from "./RDASTab";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import { ContextCapture } from "./CCCSTab";

interface TabMenu {
    accessToken: string;
    realityDataAccessClient: RealityDataAccessClient;
    authClient: BrowserAuthorizationClient;
}

export function TabMenu(props: TabMenu) {
    const [tabIndex, setTabIndex] = React.useState(0);

    // RDS
    const [uploadedDataType, setUploadedDataType] = React.useState<string>("");
    const [uploadedDataId, setUploadedDataId] = React.useState<string>("");

    const [downloadedDataId, setDownloadedDataId] = React.useState<string>("");

    // 2D
    const [imageIndex, setImageIndex] = React.useState<number>(-1);
    const [zoomLevel, setZoomLevel] = React.useState<number>(1);
    const [idViewer2D, setIdViewer2D] = React.useState<string>("");

    // 3D
    

    /** Previous photo */
    const onImageIndexChange = (newImageIndex: number): void => {
        setImageIndex(newImageIndex);
    };

    const onZoomChange = (newZoomLevel: number): void => {
        setZoomLevel(newZoomLevel);
    };

    const onDisplay2DIdChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setIdViewer2D(event.target.value);
    };

    const onUploadedDataTypeChange = (select: string): void => {
        setUploadedDataType(select);
    };

    const onUploadedDataIdChange = (id: string): void => {
        setUploadedDataId(id);
    };

    const onDownloadedIdChange = async (id: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        setDownloadedDataId(id.target.value);
    };

    const getTabs = () => {
        switch (tabIndex) {
        case 0:
            return <Rds uploadedDataType={uploadedDataType} uploadedDataId={uploadedDataId}
                downloadedDataId={downloadedDataId}           
                onUploadedDataTypeChange={onUploadedDataTypeChange} accessToken={props.accessToken}
                onUploadedDataIdChange={onUploadedDataIdChange} onDownloadedIdChange={onDownloadedIdChange}/>;
        case 1:
            return <Rdas accessToken={props.accessToken!}/>;
        case 2:
            return <ContextCapture accessToken={props.accessToken!}/>;
        case 3:
            return <Viewer2D imageIndex={imageIndex} zoomLevel={zoomLevel} idToDisplay={idViewer2D} accessToken={props.accessToken}
                onIdChange={onDisplay2DIdChange} onZoomChange={onZoomChange} onImageIndexChange={onImageIndexChange}/>;
        case 4:
            return <Viewer3D accessToken={props.accessToken!} realityDataAccessClient={props.realityDataAccessClient} authClient={props.authClient}/>;
        default:
            return <Viewer2D imageIndex={imageIndex} zoomLevel={zoomLevel} idToDisplay={idViewer2D} accessToken={props.accessToken}
                onIdChange={onDisplay2DIdChange} onZoomChange={onZoomChange} onImageIndexChange={onImageIndexChange}/>;
        }
    };

    return(
        <HorizontalTabs
            labels={[
                <Tab key={0} label="RDS" />,
                <Tab key={1} label="Reality Data Analysis" />,
                <Tab key={2} label="ContextCapture" />,
                <Tab key={3} label="Display 2D" />,
                <Tab key={4} label="Display 3D" />,
            ]}
            onTabSelected={setTabIndex}
            type="borderless">
            {getTabs()}
        </HorizontalTabs> 
    );
}