/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { StagePanelLocation, UiItemsProvider, useActiveIModelConnection, useActiveViewport, Widget, WidgetState } from "@itwin/appui-react";
import { ContextRealityModelProps, RealityDataFormat, RealityDataProvider } from "@itwin/core-common";
import { IModelApp } from "@itwin/core-frontend";
import { SvgHelpCircularHollow } from "@itwin/itwinui-icons-react";
import { Alert, Button, IconButton, Slider, ToggleSwitch } from "@itwin/itwinui-react";
import RealityData from "./RealityData";
import "./RealityData.scss";
import { RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import { SelectRealityData } from "../SelectRealityData";

interface RealityDataWidgetProps {
    realityDataAccessClient: RealityDataAccessClient;
}

const RealityDataWidget = (props: RealityDataWidgetProps) => {
    const iModelConnection = useActiveIModelConnection();
    const viewport = useActiveViewport();

    const showRealityDataState = React.useRef<Map<string, boolean>>(new Map());
    const transparencyRealityDataState = React.useRef<Map<string, number>>(new Map());
    const [availableRealityModels, setAvailableRealityModels] = React.useState<ContextRealityModelProps[]>([]);
    const [updateAttachedState, setUpdateAttachedState] = React.useState<string>("");
    const [updateTransparencyState, setUpdateTransparencyState] = React.useState<string>("");
    const [realityDataId, setRealityDataId] = React.useState<string>("");

    const [id, setId] = React.useState<string>("");

    // Initialize the widget
    useEffect(() => {
        const asyncInitialize = async () => {
            if (viewport && availableRealityModels.length) {
                const model = availableRealityModels[availableRealityModels.length - 1];
                showRealityDataState.current.set(model.tilesetUrl, true);
                RealityData.toggleRealityModel(model, viewport, true);
                RealityData.setRealityDataTransparency(model, viewport, 0);
            }
        };
        asyncInitialize();
    }, [realityDataId]);

    // When the button is toggled, display the realityModel and set its transparency to where the slider is currently set.
    useEffect(() => {
        if (iModelConnection && updateAttachedState) {
            const vp = IModelApp.viewManager.selectedView;
            if (vp && availableRealityModels && showRealityDataState) {
                const model = availableRealityModels.find((x) => x.tilesetUrl === updateAttachedState);
                if (model) {
                    RealityData.toggleRealityModel(model, vp, showRealityDataState.current.get(model.tilesetUrl));
                    RealityData.setRealityDataTransparency(model, vp, (transparencyRealityDataState.current.get(model.tilesetUrl)! / 100));
                }
            }
        }
        setUpdateAttachedState("");
    }, [availableRealityModels, iModelConnection, showRealityDataState, updateAttachedState]);

    useEffect(() => {
        if (iModelConnection && updateTransparencyState) {
            const vp = IModelApp.viewManager.selectedView;
            if (vp && availableRealityModels && showRealityDataState) {
                const model = availableRealityModels.find((x) => x.tilesetUrl === updateTransparencyState);
                if (model)
                    RealityData.setRealityDataTransparency(model, vp, transparencyRealityDataState.current.get(model.tilesetUrl)! / 100);
            }
        }
        setUpdateTransparencyState("");
    }, [availableRealityModels, iModelConnection, transparencyRealityDataState, updateTransparencyState]);


    const updateShowRealityDataState = (url: string, checked: boolean) => {
        showRealityDataState.current.set(url, checked);
        setUpdateAttachedState(url);
    };

    const updateRealityDataTransparencyState = (url: string, val: number) => {
        transparencyRealityDataState.current.set(url, val);
        setUpdateTransparencyState(url);
    };

    const onDisplay = async (): Promise<void> => {
        const list = [...availableRealityModels];
        const accessToken = await IModelApp.authorizationClient!.getAccessToken();
        const prefix = process.env.IMJS_URL_PREFIX ?? "";
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + prefix + "api.bentley.com/reality-management",
        };
        const available = await new RealityDataAccessClient(realityDataClientOptions).getRealityData(accessToken, process.env.IMJS_PROJECT_ID, id);
        const model: ContextRealityModelProps = {
            tilesetUrl: "https://" + prefix + "api.bentley.com/reality-management/" + 
                id + "?iTwinId=" + process.env.IMJS_PROJECT_ID,
            name: available.displayName,
            rdSourceKey: {
                provider: RealityDataProvider.ContextShare,
                format: available.type === "OPC" ? RealityDataFormat.OPC : RealityDataFormat.ThreeDTile,
                id: id
            }
        };
        list.push(model);
        
        // Set the blank iModel connection when the first reality data is loaded.
        if(list.length === 1)
            RealityData.onRealityDataAdd.emit({ realityDataId: id });
        
        setAvailableRealityModels(list);
        setRealityDataId(id);
    };

    return (
        <div className="sample-options">
            <div className="viewer3d-controls-group">               
                <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select photos (context scene)"} 
                    onSelectedDataChange={(select: string) => setId(select)}
                    realityDataType={["Cesium3DTiles", "OPC"]} selectedRealityData={id} />
                <Button className="viewer3d-control" onClick={onDisplay} disabled={id === ""}>Display</Button>
            </div>
            <div className="sample-options-col">
                {availableRealityModels && availableRealityModels.map((element, index) => {
                    return (
                        <div key={`reality-model-${index}`}>
                            <ToggleSwitch
                                defaultChecked
                                label={element.name}
                                key={element.tilesetUrl}
                                style={{ marginBottom: "8px" }}
                                onChange={(event) => updateShowRealityDataState(element.tilesetUrl, event.target.checked)} 
                            />
                            <div>
                                <div className="slider-label">
                                    <span>Transparency</span>
                                    <IconButton size="small" styleType="borderless" title="Adjusting this slider changes the transparency of the reality data"><SvgHelpCircularHollow /></IconButton>
                                </div>
                                <Slider
                                    min={0}
                                    max={99}
                                    values={[transparencyRealityDataState.current.get(element.tilesetUrl) ?? 0]}
                                    onChange={(values) => updateRealityDataTransparencyState(element.tilesetUrl, values[0])}
                                />
                            </div>
                        </div>);
                })
                }
            </div>
            <Alert type="informational" className="instructions">
            Use the toggles for displaying the reality data in the model.
            </Alert>
        </div>
    );

};


export class RealityDataWidgetProvider implements UiItemsProvider {
    public readonly id: string = "RealityDataWidgetProvider";
    public realityDataAccessClient: RealityDataAccessClient;

    constructor(realityDataAccessClient: RealityDataAccessClient) {
        this.realityDataAccessClient = realityDataAccessClient;
    }

    public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation): ReadonlyArray<Widget> {
        const widgets: Widget[] = [];
        if (location === StagePanelLocation.Bottom) {
            widgets.push(
                {
                    id: "RealityDataWidget",
                    label: "Reality Data Controls",
                    defaultState: WidgetState.Open,
                    content: <RealityDataWidget realityDataAccessClient={this.realityDataAccessClient}/>,
                },
            );
        }
        return widgets;
    }
}

