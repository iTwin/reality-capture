/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect, useMemo } from "react";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import "./Viewer3D.css";
import { Viewer, ViewerContentToolsProvider, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataWidgetProvider } from "./3dUtils/RealityDataWidget";
import { Cartographic } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";
import RealityData from "./3dUtils/RealityData";
import { BlankConnection, IModelApp } from "@itwin/core-frontend";
import { UiFramework } from "@itwin/appui-react";
import { createBlankViewState, getBlankConnection } from "./3dUtils/RealityDataCrs";


interface Viewer3DProps {
    realityDataAccessClient: RealityDataAccessClient;
    authClient: BrowserAuthorizationClient;
}

export function Viewer3D(props: Viewer3DProps) {

    const [firstDisplayedRealityData, setFirstDisplayedRealityData] = React.useState<string>("");

    // Add a listener to get mesh/opc blank connection props (extent and location).
    useEffect(() => {
        RealityData.onRealityDataAdd.addListener((event) => {
            setFirstDisplayedRealityData(event.realityDataId);
        });
    }, []);

    // Set blank connection props when the first reality data is loaded.
    useEffect(() => {
        if(!firstDisplayedRealityData)
            return;
        
        const getBlankConnectionProps = async () => {
            const blankConnection = await getBlankConnection(firstDisplayedRealityData, await props.authClient.getAccessToken());
            const iModelConnection = BlankConnection.create(blankConnection);
            const viewState = await createBlankViewState(await props.authClient.getAccessToken(), iModelConnection, 
                firstDisplayedRealityData);
            UiFramework.setIModelConnection(iModelConnection);
            if(viewState) {
                for (const viewPort of IModelApp.viewManager) {
                    viewPort.applyViewState(viewState);
                }
            }
        };
        getBlankConnectionProps();
    }, [firstDisplayedRealityData]);

    const uiProviders = useMemo(
        () =>
            new RealityDataWidgetProvider(props.realityDataAccessClient),
        []
    );

    return(
        <div className="viewer3d">
            {props.authClient && (
                <div id="test" className="viewer-container">
                    <Viewer
                        iTwinId={import.meta.env.IMJS_PROJECT_ID}
                        authClient={props.authClient}
                        location={Cartographic.fromDegrees({longitude: -75.686694, latitude: 40.065757, height: 0})}
                        extents={new Range3d(-1000, -1000, -100, 1000, 1000, 100)}
                        enablePerformanceMonitors={false}
                        uiProviders={[uiProviders,
                            new ViewerContentToolsProvider({
                                vertical: {
                                    selectElement: false,
                                    measureGroup: false,
                                    sectionGroup: false,
                                },
                            }),
                            new ViewerNavigationToolsProvider({
                                horizontal: {
                                    rotateView: true,
                                    panView: true,
                                    fitView: true,
                                    windowArea: true,
                                    viewUndoRedo: true,
                                },
                                vertical: {
                                    walk: false,
                                    toggleCamera: false,
                                },
                            }),                           
                        ]}
                        realityDataAccess={props.realityDataAccessClient}                        
                    />
                </div>
            )}
        </div>
    );
}