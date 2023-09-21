/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { UiEvent } from "@itwin/appui-abstract";
import { ContextRealityModelProps, FeatureAppearance } from "@itwin/core-common";
import { ScreenViewport } from "@itwin/core-frontend";

interface RealityDataAddEventArgs {
    realityDataId: string;
}

class RealityDataAdd extends UiEvent<RealityDataAddEventArgs> { }

export default class RealityData {

    public static readonly onRealityDataAdd = new RealityDataAdd();

    public static toggleRealityModel(crmProp: ContextRealityModelProps, viewPort: ScreenViewport, show?: boolean) {
        const crmName = crmProp.name ? crmProp.name : "";

        if (show && !viewPort.displayStyle.hasAttachedRealityModel(crmName, crmProp.tilesetUrl)) {
            viewPort.displayStyle.attachRealityModel(crmProp);
        } 
        else if (!show) {
            viewPort.displayStyle.detachRealityModelByNameAndUrl(crmName, crmProp.tilesetUrl);
        }
        viewPort.invalidateScene();
    }

    // Modify reality data background transparency using the Viewport API
    public static setRealityDataTransparency(crmProp: ContextRealityModelProps, vp: ScreenViewport, transparency?: number) {
        if (transparency === undefined)
            transparency = 0;

        vp.displayStyle.settings.contextRealityModels.models.forEach((model) => {
            if (model.matchesNameAndUrl(crmProp.name ?? "", crmProp.tilesetUrl))
            {
                model.appearanceOverrides = model.appearanceOverrides ? model.appearanceOverrides.clone({ transparency }) : FeatureAppearance.fromJSON({ transparency });
            }
        });

        return true;
    }

}
