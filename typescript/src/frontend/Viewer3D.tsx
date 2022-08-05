import React, { useMemo } from "react";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import "./Viewer3D.css";
import { Viewer, ViewerContentToolsProvider, ViewerNavigationToolsProvider } from "@itwin/web-viewer-react";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataWidgetProvider } from "./api/RealityDataWidget";
import { Cartographic } from "@itwin/core-common";
import { Range3d } from "@itwin/core-geometry";

interface Viewer3DProps {
    accessToken: string;
    realityDataAccessClient: RealityDataAccessClient;
    authClient: BrowserAuthorizationClient;
}

export function Viewer3D(props: Viewer3DProps) {

    const uiProviders = useMemo(
        () =>
            new RealityDataWidgetProvider(),
        []
    );

    return(
        <div className="viewer3d">
            {props.accessToken && (
                <div id="test" className="viewer-container">                  
                    <Viewer
                        authClient={props.authClient}
                        blankConnection={{
                            name: "Test",
                            location: Cartographic.fromDegrees({longitude: -75.686694, latitude: 40.065757, height: 0}),
                            extents: new Range3d(-1000, -1000, -100, 1000, 1000, 100),
                        }}
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