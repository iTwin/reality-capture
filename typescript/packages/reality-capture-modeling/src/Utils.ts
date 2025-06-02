/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { JobDates, iTwinCaptureError, iTwinCaptureWarning } from "@itwin/reality-capture-common";

/** Possible types of a Reality Modeling job. */
export enum CCJobType {
    NONE = "not recognized",
    CALIBRATION = "Calibration",
    RECONSTRUCTION = "Reconstruction",
    FULL = "Full",
}

/** 
 * Properties of a workspace.
 * Convenience interface to stock all properties of a job in a simple way.
 */
export interface CCWorkspaceProperties {
    id: string;
    createdDateTime: string;
    name: string;
    iTwinId: string;
    contextCaptureVersion?: string;
}

/**
 * Parameters for estimating job cost before its processing.
 */
export interface CCCostParameters {
    gigaPixels?: number;
    megaPoints?: number;
    meshQuality?: CCJobQuality;
}

/**
 * Properties of a Reality Modeling job.
 * Convenience interface to stock all properties of a job in a simple way.
 */
export interface CCJobProperties {
    name: string;
    type: CCJobType;
    settings: CCJobSettings;
    workspaceId: string;
    iTwinId: string;
    id: string;
    location?: string;
    email?: string;
    state?: string;
    dates?: JobDates;
    exitCode?: string;
    executionCost?: string;
    costEstimationParameters?: CCCostParameters;
    estimatedCost?: string;
    errors: iTwinCaptureError[];
    warnings: iTwinCaptureWarning[];
}

/** Possible qualities of a Reality Modeling job. */
export enum CCJobQuality {
    UNKNOWN = "Unknown",
    DRAFT = "Draft",
    MEDIUM = "Medium",
    EXTRA = "Extra",
}

/** 
 * Cache settings for a Reality Modeling Job.
 */
export interface CCCacheSettings {
    createCache: boolean;
    useCache: string;
}

/**
 * Possible outputs for a Reality Modeling job.
 */
class CCOutputs {
    /** Created context scene id. */
    contextScene: string;
    /** Created ccorientation id. */
    orientations: string;
    /** Created 3MX id. */
    threeMX: string;
    /** Created 3SM id. */
    threeSM: string;
    /** Created web ready scalable mesh id. */
    webReadyScalableMesh: string;
    /** Created cesium 3D tiles id. */
    cesium3DTiles: string;
    /** Created pod id. */
    pod: string;
    /** Created orthophoto id. */
    orthophoto: string;
    /** Created las id. */
    las: string;
    /** Created fbx id. */
    fbx: string;
    /** Created obj id. */
    obj: string;
    /** Created esri i3s id. */
    esri: string;
    /** Created dgn id. */
    dgn: string;
    /** Created load tree export id. */
    lodTreeExport: string;
    /** Created ply id. */
    ply: string;
    /** Created opc id. */
    opc: string;
    /** Created omr id. */
    omr: string;
    /** Gaussian splats id */
    gaussianSplats: string

    constructor() {
        /**
         * Created context scene id.
         * @type {string}
         */
        this.contextScene = "";
        /**
         * Created ccorientation id.
         * @type {string}
         */
        this.orientations = "";
        /**
         * Created 3MX id.
         * @type {string}
         */
        this.threeMX = "";
        /**
         * Created 3SM id.
         * @type {string}
         */
        this.threeSM = "";
        /**
         * Created web ready scalable mesh id.
         * @type {string}
         */
        this.webReadyScalableMesh = "";
        /**
         * Created cesium 3D Tiles id.
         * @type {string}
         */
        this.cesium3DTiles = "";
        /**
         * Created pod id.
         * @type {string}
         */
        this.pod = "";
        /**
         * Created orthophoto id.
         * @type {string}
         */
        this.orthophoto = "";
        /**
         * Created las id.
         * @type {string}
         */
        this.las = "";
        /**
         * Created fbx id.
         * @type {string}
         */
        this.fbx = "";
        /**
         * Created obj id.
         * @type {string}
         */
        this.obj = "";
        /**
         * Created esri i3s id.
         * @type {string}
         */
        this.esri = "";
        /**
         * Created dgn id.
         * @type {string}
         */
        this.dgn = "";
        /**
         * Created load tree export id.
         * @type {string}
         */
        this.lodTreeExport = "";
        /**
         * Created ply id.
         * @type {string}
         */
        this.ply = "";
        /**
         * Created opc id.
         * @type {string}
         */
        this.opc = "";
        /**
         * Created omr id.
         * @type {string}
         */
        this.omr = "";
        /** 
         * Gaussian splats id
         * @type {string}
         */
        this.gaussianSplats = "";
    }
}

/** Settings for Reality Modeling jobs. */
export class CCJobSettings {
    /** Possible inputs for this job. Should be the ids of the inputs in the cloud. */
    inputs: string[];
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: CCOutputs;

    /** Mesh quality for this job. */
    meshQuality?: CCJobQuality;

    /** Quantity of engines to be used by the job. If set at 0, the job will use your engine limit. */
    engines?: number;

    /** Cache settings for this job. */
    cacheSettings?: CCCacheSettings;

    constructor() {
        /** 
         * Possible inputs for this job. 
         * @type {CCInputs}
         */
        this.inputs = [];
        /** 
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
         * @type {CCOutputs}
         */
        this.outputs = new CCOutputs();

        /**
         * Mesh quality for this job.
         * @type {CCJobQuality}
         */
        this.meshQuality = CCJobQuality.UNKNOWN;

        /** 
         * Number of engines to be used at most, between 0 and your engine limit. If set at 0, it will use your engine limit. 
         * @type {number}
         */
        this.engines = 0;
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};

        json["inputs"] = [];
        for (const input of this.inputs) {
            json["inputs"].push({ "id": input });
        }

        json["settings"] = {};
        json["settings"]["outputs"] = [];
        if (this.outputs.cesium3DTiles)
            json["settings"]["outputs"].push("Cesium 3D Tiles");

        if (this.outputs.dgn)
            json["settings"]["outputs"].push("DGN");

        if (this.outputs.esri)
            json["settings"]["outputs"].push("ESRI i3s");

        if (this.outputs.webReadyScalableMesh)
            json["settings"]["outputs"].push("WebReady ScalableMesh");

        if (this.outputs.fbx)
            json["settings"]["outputs"].push("FBX");

        if (this.outputs.las)
            json["settings"]["outputs"].push("LAS");

        if (this.outputs.lodTreeExport)
            json["settings"]["outputs"].push("LODTreeExport");

        if (this.outputs.obj)
            json["settings"]["outputs"].push("OBJ");

        if (this.outputs.opc)
            json["settings"]["outputs"].push("OPC");

        if (this.outputs.omr)
            json["settings"]["outputs"].push("OMR");

        if (this.outputs.orientations)
            json["settings"]["outputs"].push("CCOrientations");

        if (this.outputs.orthophoto)
            json["settings"]["outputs"].push("Orthophoto/DSM");

        if (this.outputs.ply)
            json["settings"]["outputs"].push("PLY");

        if (this.outputs.pod)
            json["settings"]["outputs"].push("POD");

        if (this.outputs.threeMX)
            json["settings"]["outputs"].push("3MX");

        if (this.outputs.threeSM)
            json["settings"]["outputs"].push("3SM");

        if (this.outputs.contextScene)
            json["settings"]["outputs"].push("ContextScene");

        if (this.outputs.gaussianSplats)
            json["settings"]["outputs"].push("GaussianSplats");

        if (this.cacheSettings) {
            json["settings"]["cacheSettings"] = {
                "createCache": this.cacheSettings.createCache,
                "useCache": this.cacheSettings.useCache
            };
        }

        if (this.meshQuality) {
            json["settings"]["quality"] = this.meshQuality;
        }

        if (this.engines) {
            json["settings"]["processingEngines"] = this.engines;
        }

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} jobJson Dictionary with settings received from cloud service.
     * @returns {CCJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<CCJobSettings> {
        const newJobSettings = new CCJobSettings();

        for (const input of settingsJson["inputs"]) {
            newJobSettings.inputs.push(input["id"]);
        }
        const outputsJson = settingsJson["jobSettings"]["outputs"];
        for (const output of outputsJson) {
            if (output["format"] === "Cesium 3D Tiles")
                newJobSettings.outputs.cesium3DTiles = output["id"];
            else if (output["format"] === "DGN")
                newJobSettings.outputs.dgn = output["id"];
            else if (output["format"] === "ESRI i3s")
                newJobSettings.outputs.esri = output["id"];
            else if (output["format"] === "FBX")
                newJobSettings.outputs.fbx = output["id"];
            else if (output["format"] === "LAS")
                newJobSettings.outputs.las = output["id"];
            else if (output["format"] === "LODTreeExport")
                newJobSettings.outputs.lodTreeExport = output["id"];
            else if (output["format"] === "OBJ")
                newJobSettings.outputs.obj = output["id"];
            else if (output["format"] === "OPC")
                newJobSettings.outputs.opc = output["id"];
            else if (output["format"] === "OMR")
                newJobSettings.outputs.omr = output["id"];
            else if (output["format"] === "CCOrientations")
                newJobSettings.outputs.orientations = output["id"];
            else if (output["format"] === "Orthophoto/DSM")
                newJobSettings.outputs.orthophoto = output["id"];
            else if (output["format"] === "PLY")
                newJobSettings.outputs.ply = output["id"];
            else if (output["format"] === "POD")
                newJobSettings.outputs.pod = output["id"];
            else if (output["format"] === "3MX")
                newJobSettings.outputs.threeMX = output["id"];
            else if (output["format"] === "3SM")
                newJobSettings.outputs.threeSM = output["id"];
            else if (output["format"] === "ContextScene")
                newJobSettings.outputs.contextScene = output["id"];
            else if (output["format"] === "WebReady ScalableMesh")
                newJobSettings.outputs.webReadyScalableMesh = output["id"];
            else if (output["format"] === "GaussianSplats")
                newJobSettings.outputs.gaussianSplats = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output name : " + output["format"]));
        }
        if ("cacheSettings" in settingsJson["jobSettings"])
            newJobSettings.cacheSettings = {
                useCache: settingsJson["jobSettings"]["cacheSettings"]["useCache"],
                createCache: settingsJson["jobSettings"]["cacheSettings"]["createCache"],
            };

        if ("quality" in settingsJson["jobSettings"])
            newJobSettings.meshQuality = settingsJson["jobSettings"]["quality"];

        if ("processingEngines" in settingsJson["jobSettings"])
            newJobSettings.engines = settingsJson["jobSettings"]["processingEngines"];

        return newJobSettings;
    }
}
