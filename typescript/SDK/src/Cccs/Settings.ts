
/** Possible mesh qualities. */
export enum CCMeshQuality {
    NONE = "not recognized",
    DRAFT = "Draft",
    MEDIUM = "Medium",
    EXTRA = "Extra",
}

/** 
 * Cache settings properties.
 */
export interface CCCacheSettings {
    createCache: boolean;
    useCache: string;
}

/**
 * Possible outputs for a ContextCapture job.
 */
class CCOutputs {
    orientations: string;
    threeMX: string;
    threeSM: string;
    webReadyScalableMesh: string;
    cesium3DTiles: string;
    pod: string;
    orthophoto: string;
    las: string;
    fbx: string;
    obj: string;
    esri: string;
    dgn: string;
    lodTreeExport: string;
    ply: string;
    opc: string;
    contextScene: string;

    constructor() {
        this.orientations = "";
        this.threeMX = "";
        this.threeSM = "";
        this.webReadyScalableMesh = "";
        this.cesium3DTiles = "";
        this.pod = "";
        this.orthophoto = "";
        this.las = "";
        this.fbx = "";
        this.obj = "";
        this.esri = "";
        this.dgn = "";
        this.lodTreeExport = "";
        this.ply = "";
        this.opc = "";
        this.contextScene = "";
    }
}

/** Settings for ContextCapture jobs. */
export class CCJobSettings {
    /** Possible inputs for this job. */
    inputs: string[];
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: CCOutputs;

    /** Mesh quality for this job. */
    meshQuality?: CCMeshQuality;

    /** Number of engines to be used at most, between 0 and your engine limit. If set at 0, CCCS will use your engine limit. */
    processingEngines?: number;

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
         * @type {CCMeshQuality}
         */
        this.meshQuality = CCMeshQuality.MEDIUM;
        
        /** 
         * Number of engines to be used at most, between 0 and your engine limit. If set at 0, CCCS will use your engine limit. 
         * @type {number}
         */
        this.processingEngines = 0;
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};

        json["inputs"] = [];
        for(const input of this.inputs) {
            json["inputs"].push({"id": input});
        }

        json["settings"] = {};
        json["settings"]["outputs"] = [];
        if(this.outputs.cesium3DTiles)
            json["settings"]["outputs"].push("Cesium 3D Tiles");

        if(this.outputs.dgn)
            json["settings"]["settings"]["outputs"].push("DGN");

        if(this.outputs.esri)
            json["outputs"].push("ESRI i3s");

        if(this.outputs.fbx)
            json["settings"]["outputs"].push("FBX");

        if(this.outputs.las)
            json["settings"]["outputs"].push("LAS");

        if(this.outputs.lodTreeExport)
            json["settings"]["outputs"].push("LODTreeExport");

        if(this.outputs.obj)
            json["settings"]["outputs"].push("OBJ");

        if(this.outputs.opc)
            json["settings"]["outputs"].push("OPC");

        if(this.outputs.orientations)
            json["settings"]["outputs"].push("CCOrientations");

        if(this.outputs.orthophoto)
            json["settings"]["outputs"].push("Orthophoto/DSM");

        if(this.outputs.ply)
            json["settings"]["outputs"].push("PLY");

        if(this.outputs.pod)
            json["settings"]["outputs"].push("POD");

        if(this.outputs.threeMX)
            json["settings"]["outputs"].push("3MX");

        if(this.outputs.threeSM)
            json["settings"]["outputs"].push("3SM");

        if(this.outputs.contextScene)
            json["settings"]["outputs"].push("ContextScene");

        if(this.cacheSettings) {
            json["settings"]["cacheSettings"] = {
                "createCache": this.cacheSettings.createCache,
                "useCache": this.cacheSettings.useCache
            }
        }

        if(this.meshQuality) {
            json["meshQuality"] = this.meshQuality;
        }

        if(this.processingEngines) {
            json["processingEngines"] = this.processingEngines;
        }
        
        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {CCJobSettings | Error} New settings, or an error message.
     */
    public static fromJson(inputsJson: any, settingsJson: any): CCJobSettings | Error {
        const newJobSettings = new CCJobSettings();

        try {
            for(const input of inputsJson) {
                newJobSettings.inputs.push(input["id"]);
            }
            const outputsJson = settingsJson["outputs"];
            for(const output of outputsJson) {
                if(output["format"] === "Cesium 3D Tiles")
                    newJobSettings.outputs.cesium3DTiles = output["id"];
                else if(output["format"] === "DGN")
                    newJobSettings.outputs.dgn = output["id"];
                else if(output["format"] === "ESRI i3s")
                    newJobSettings.outputs.esri = output["id"];
                else if(output["format"] === "FBX")
                    newJobSettings.outputs.fbx = output["id"];
                else if(output["format"] === "LAS")
                    newJobSettings.outputs.las = output["id"];
                else if(output["format"] === "LODTreeExport")
                    newJobSettings.outputs.lodTreeExport = output["id"];
                else if(output["format"] === "OBJ")
                    newJobSettings.outputs.obj = output["id"];
                else if(output["format"] === "OPC")
                    newJobSettings.outputs.opc = output["id"];
                else if(output["format"] === "CCOrientations")
                    newJobSettings.outputs.orientations = output["id"];
                else if(output["format"] === "Orthophoto/DSM")
                    newJobSettings.outputs.orthophoto = output["id"];
                else if(output["format"] === "PLY")
                    newJobSettings.outputs.ply = output["id"];
                else if(output["format"] === "POD")
                    newJobSettings.outputs.pod = output["id"];
                else if(output["format"] === "3MX")
                    newJobSettings.outputs.threeMX = output["id"];
                else if(output["format"] === "3SM")
                    newJobSettings.outputs.threeSM = output["id"];
                else if(output["format"] === "ContextScene")
                    newJobSettings.outputs.contextScene = output["id"];
                else
                    return TypeError("found non expected output name" + output["name"]);
            }
            if("cacheSettings" in settingsJson)
                newJobSettings.cacheSettings = JSON.parse(settingsJson["cacheSettings"]);
            
            if("exportSrs" in settingsJson)
                newJobSettings.meshQuality = settingsJson["meshQuality"];

            if("processingEngines" in settingsJson)
                newJobSettings.processingEngines = settingsJson["processingEngines"];

        }
        catch (e: any) {
            return e;
        }
        return newJobSettings;
    }
}