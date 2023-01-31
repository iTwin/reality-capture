/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/


/** Possible types of a job. */
export enum RDAJobType {
    NONE = "not recognized",
    O2D = "objects2D",
    S2D = "segmentation2D",
    O3D = "objects3D",
    S3D = "segmentation3D",
    ChangeDetection = "changeDetection",
    L3D = "lines3D",
}

/**
 * Possible inputs for an Object Detection 2D job.
 */
class O2DInputs {
    /** Path to ContextScene with photos to analyze. */
    photos: string;
    /** Path to photo object detector to apply. */
    photoObjectDetector: string;

    constructor() {
        /**
         * Path to ContextScene with photos to analyze..
         * @type {string}
         */
        this.photos = "";
        /**
         * Path to photo object detector to apply.
         * @type {string}
         */
        this.photoObjectDetector = "";
    }
}

/**
 * Possible outputs for an Object Detection 2D job.
 */
class O2DOutputs {
    /** Objects detected in photos. */
    objects2D: string;

    constructor() {
        /**
         * Objects detected in photos.
         * @type {string}
         */
        this.objects2D = "";
    }
}

/** Settings for Object Detection 2D jobs. */
export class O2DJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job. */
    inputs: O2DInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: O2DOutputs;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.O2D;
        /** 
         * Possible inputs for this job. 
         * @type {O2DInputs}
         */
        this.inputs = new O2DInputs();
        /** 
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
         * @type {O2DOutputs}
         */
        this.outputs = new O2DOutputs();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.photos)
            json["inputs"].push({ "name": "photos", "realityDataId": this.inputs.photos });

        if (this.inputs.photoObjectDetector)
            json["inputs"].push({ "name": "photoObjectDetector", "realityDataId": this.inputs.photoObjectDetector });

        json["outputs"] = [];
        if (this.outputs.objects2D)
            json["outputs"].push("objects2D");

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {O2DJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<O2DJobSettings> {
        const newJobSettings = new O2DJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["name"] === "photos")
                newJobSettings.inputs.photos = input["realityDataId"];
            else if (input["name"] === "photoObjectDetector")
                newJobSettings.inputs.photoObjectDetector = input["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected input name" + input["name"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["name"] === "objects2D")
                newJobSettings.outputs.objects2D = output["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected output name" + output["name"]));
        }

        return newJobSettings;
    }
}

/**
 * Possible inputs for a Segmentation 2D job.
 */
class S2DInputs {
    /** Path to ContextScene with photos to analyze. */
    photos: string;
    /** Path to photo segmentation detector to apply. */
    photoSegmentationDetector: string;
    /** Path to orthophoto to analyse. */
    orthophoto: string;
    /** Path to orthophoto segmentation detector to apply. */
    orthophotoSegmentationDetector: string;

    constructor() {
        /**
         * Path to ContextScene with photos to analyze.
         * @type {string}
         */
        this.photos = "";
        /**
         * Path to photo segmentation detector to apply.
         * @type {string}
         */
        this.photoSegmentationDetector = "";
        /**
         * Path to orthophoto to analyse.
         * @type {string}
         */
        this.orthophoto = "";
        /**
         * Path to orthophoto segmentation detector to apply.
         * @type {string}
         */
        this.orthophotoSegmentationDetector = "";
    }
}

/**
 * 
 */
class S2DOutputs {
    /** Segmented photos. */
    segmentation2D: string;
    /** Detected 2D polygons. */
    polygons2D: string;
    /** 2D polygons exported to ESRI shapefile. */
    exportedPolygons2DSHP: string;
    /** Detected 2D lines. */
    lines2D: string;
    /** ContextScene pointing to segmented photos. */
    segmentedPhotos: string;
    /** 2D lines exported to ESRI shapefile. */
    exportedLines2DSHP: string;
    /** 2D lines exported to DGN file. */
    exportedLines2DDGN: string;

    constructor() {
        /**
         * Segmented photos.
         * @type {string}
         */
        this.segmentation2D = "";
        /**
         * Detected 2D polygons.
         * @type {string}
         */
        this.polygons2D = "";
        /**
         * 2D polygons exported to ESRI shapefile.
         * @type {string}
         */
        this.exportedPolygons2DSHP = "";
        /**
         * Detected 2D lines.
         * @type {string}
         */
        this.lines2D = "";
        /**
         * ContextScene pointing to segmented photos.
         * @type {string}
         */
        this.segmentedPhotos = "";
        /**
         * 2D lines exported to ESRI shapefile.
         * @type {string}
         */
        this.exportedLines2DSHP = "";
        /**
         * 2D lines exported to DGN file.
         * @type {string}
         */
        this.exportedLines2DDGN = "";
    }
}

/**
 * Settings for Segmentation 2D jobs.
 */
export class S2DJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job. */
    inputs: S2DInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob.
     */
    outputs: S2DOutputs;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.S2D;
        /**
         * Possible inputs for this job.
         * @type {S2DInputs}
         */
        this.inputs = new S2DInputs();
        /**
         * Possible outputs for this job.
         * @type {S2DOutputs}
         */
        this.outputs = new S2DOutputs();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.photos)
            json["inputs"].push({ "name": "photos", "realityDataId": this.inputs.photos });

        if (this.inputs.photoSegmentationDetector)
            json["inputs"].push({ "name": "photoSegmentationDetector", "realityDataId": this.inputs.photoSegmentationDetector });

        if (this.inputs.orthophoto)
            json["inputs"].push({ "name": "orthophoto", "realityDataId": this.inputs.orthophoto });

        if (this.inputs.orthophotoSegmentationDetector)
            json["inputs"].push({ "name": "orthophotoSegmentationDetector", "realityDataId": this.inputs.orthophotoSegmentationDetector });

        json["outputs"] = [];
        if (this.outputs.segmentation2D)
            json["outputs"].push("segmentation2D");

        if(this.outputs.segmentedPhotos)
            json["outputs"].push("segmentedPhotos")

        if (this.outputs.polygons2D)
            json["outputs"].push("polygons2D");

        if (this.outputs.exportedPolygons2DSHP)
            json["outputs"].push("exportedPolygons2DSHP");

        if (this.outputs.lines2D)
            json["outputs"].push("lines2D");

        if (this.outputs.exportedLines2DDGN)
            json["outputs"].push("exportedLines2DDGN");

        if (this.outputs.exportedLines2DSHP)
            json["outputs"].push("exportedLines2DSHP");

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {S2DJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<S2DJobSettings> {
        const newJobSettings = new S2DJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["name"] === "photos")
                newJobSettings.inputs.photos = input["realityDataId"];
            else if (input["name"] === "photoSegmentationDetector")
                newJobSettings.inputs.photoSegmentationDetector = input["realityDataId"];
            else if (input["name"] === "orthophoto")
                newJobSettings.inputs.orthophoto = input["realityDataId"];
            else if (input["name"] === "orthophotoSegmentationDetector")
                newJobSettings.inputs.orthophotoSegmentationDetector = input["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected input name" + input["name"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["name"] === "segmentation2D")
                newJobSettings.outputs.segmentation2D = output["realityDataId"];
            else if(output["name"] === "segmentedPhotos")
                newJobSettings.outputs.segmentedPhotos = output["realityDataId"];
            else if (output["name"] === "polygons2D")
                newJobSettings.outputs.polygons2D = output["realityDataId"];
            else if (output["name"] === "exportedPolygons2DSHP")
                newJobSettings.outputs.exportedPolygons2DSHP = output["realityDataId"];
            else if (output["name"] === "lines2D")
                newJobSettings.outputs.lines2D = output["realityDataId"];
            else if (output["name"] === "exportedLines2DDGN")
                newJobSettings.outputs.exportedLines2DDGN = output["realityDataId"];
            else if (output["name"] === "exportedLines2DSHP")
                newJobSettings.outputs.exportedLines2DSHP = output["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected output name" + output["name"]));
        }

        return newJobSettings;
    }
}

/** 
 * Possible inputs for an Object Detection 3D job.
 */
class O3DInputs {
    /** Path to ContextScene with oriented photos to analyze. */
    orientedPhotos: string;
    /** Collection of point clouds. */
    pointClouds: string;
    /** Path to photo object detector to apply. */
    photoObjectDetector: string;
    /** Given 2D objects. */
    objects2D: string;

    constructor() {
        /**
         * Path to ContextScene with oriented photos to analyze.
         * @type {string}
         */
        this.orientedPhotos = "";
        /**
         * Collection of point clouds.
         * @type {string}
         */
        this.pointClouds = "";
        /**
         * Path to photo object detector to apply.
         * @type {string}
         */
        this.photoObjectDetector = "";
        /**
         * Given 2D objects.
         * @type {string}
         */
        this.objects2D = "";
    }
}

/**
 * Possible outputs for an Object Detection 3D job.
 */
class O3DOutputs {
    /** 2D objects detected by current job. */
    objects2D: string;
    /** Detected 3D objects. */
    objects3D: string;
    /** DGN file export with 3D objects. */
    exportedObjects3DDGN: string;
    /** Cesium 3D Tiles file export with 3D objects. */
    exportedObjects3DCesium: string;
    /** ESRI SHP file export with locations of the 3D objects. */
    exportedLocations3DSHP: string;
    /** Collection of meshes. */
    meshes: string;

    constructor() {
        /**
         * 2D objects detected by current job.
         * @type {string}
         */
        this.objects2D = "";
        /**
         * Detected 3D objects.
         * @type {string}
         */
        this.objects3D = "";
        /**
         * DGN file export with 3D objects.
         * @type {string}
         */
        this.exportedObjects3DDGN = "";
        /**
         * Cesium 3D Tiles file export with 3D objects.
         * @type {string}
         */
        this.exportedObjects3DCesium = "";
        /**
         * ESRI SHP file export with locations of the 3D objects.
         * @type {string}
         */
        this.exportedLocations3DSHP = "";
        /**
         * Collection of meshes.
         * @type {string}
         */
        this.meshes = "";
    }
}

/**
 * Settings for Object Detection 3D jobs.
 */
export class O3DJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job. */
    inputs: O3DInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: O3DOutputs;
    /** Improve detection using tie points in orientedPhotos. */
    useTiePoints: boolean;
    /** Minimum number of 2D objects to generate a 3D object. */
    minPhotos: number;
    /** Maximum distance between photos and 3D objects. */
    maxDist: number;
    /** SRS used by exports. */
    exportSrs: string;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.O3D;
        /**
         * Possible inputs for this job.
         * @type {O3DInputs}
         */
        this.inputs = new O3DInputs();
        /**
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
         * @type {O3DOutputs}
         */
        this.outputs = new O3DOutputs();
        /**
         * Improve detection using tie points in orientedPhotos.
         * @type {boolean}
         */
        this.useTiePoints = false;
        /**
         * Minimum number of 2D objects to generate a 3D object.
         * @type {number}
         */
        this.minPhotos = 0;
        /**
         * Maximum distance between photos and 3D objects.
         * @type {number}
         */
        this.maxDist = 0;
        /**
         * SRS used by exports.
         * @type {string}
         */
        this.exportSrs = "";
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.orientedPhotos)
            json["inputs"].push({ "name": "orientedPhotos", "realityDataId": this.inputs.orientedPhotos });
        if (this.inputs.photoObjectDetector)
            json["inputs"].push({ "name": "photoObjectDetector", "realityDataId": this.inputs.photoObjectDetector });
        if (this.inputs.objects2D)
            json["inputs"].push({ "name": "objects2D", "realityDataId": this.inputs.objects2D });
        if (this.inputs.pointClouds)
            json["inputs"].push({ "name": "pointClouds", "realityDataId": this.inputs.pointClouds });
        
        json["outputs"] = [];
        if (this.outputs.objects2D)
            json["outputs"].push("objects2D");
        if (this.outputs.objects3D)
            json["outputs"].push("objects3D");
        if (this.outputs.exportedObjects3DDGN)
            json["outputs"].push("exportedObjects3DDGN");
        if (this.outputs.exportedObjects3DCesium)
            json["outputs"].push("exportedObjects3DCesium");
        if (this.outputs.exportedLocations3DSHP)
            json["outputs"].push("exportedLocations3DSHP");
        if (this.outputs.meshes)
            json["outputs"].push("meshes");
        
        if (this.useTiePoints)
            json["UseTiePoints"] = "true";
        if (this.minPhotos)
            json["MinPhotos"] = this.minPhotos.toString();
        if (this.maxDist)
            json["MaxDist"] = this.maxDist.toString();
        if (this.exportSrs)
            json["exportSrs"] = this.exportSrs;

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {O3DJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<O3DJobSettings> {
        const newJobSettings = new O3DJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["name"] === "orientedPhotos")
                newJobSettings.inputs.orientedPhotos = input["realityDataId"];
            else if (input["name"] === "photoObjectDetector")
                newJobSettings.inputs.photoObjectDetector = input["realityDataId"];
            else if (input["name"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["realityDataId"];
            else if (input["name"] === "objects2D")
                newJobSettings.inputs.objects2D = input["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected input name" + input["name"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["name"] === "objects2D")
                newJobSettings.outputs.objects2D = output["realityDataId"];
            else if (output["name"] === "objects3D")
                newJobSettings.outputs.objects3D = output["realityDataId"];
            else if (output["name"] === "exportedObjects3DDGN")
                newJobSettings.outputs.exportedObjects3DDGN = output["realityDataId"];
            else if (output["name"] === "exportedObjects3DCesium")
                newJobSettings.outputs.exportedObjects3DCesium = output["realityDataId"];
            else if (output["name"] === "exportedLocations3DSHP")
                newJobSettings.outputs.exportedLocations3DSHP = output["realityDataId"];
            else if (output["name"] === "meshes")
                newJobSettings.outputs.meshes = output["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected output name" + output["name"]));
        }
        if ("exportSrs" in settingsJson)
            newJobSettings.exportSrs = settingsJson["exportSrs"];
        if ("minPhotos" in settingsJson)
            newJobSettings.minPhotos = JSON.parse(settingsJson["minPhotos"]);
        if ("maxDist" in settingsJson)
            newJobSettings.maxDist = JSON.parse(settingsJson["maxDist"]);
        if ("useTiePoints" in settingsJson)
            newJobSettings.useTiePoints = JSON.parse(settingsJson["useTiePoints"]);

        return newJobSettings;
    }
}

/**
 * Possible inputs for a Segmentation 3D job.
 */
class S3DInputs {
    /** Collection of point clouds. */
    pointClouds: string;
    /** Collection of meshes. */
    meshes: string;
    /** Point cloud segmentation detector. */
    pointCloudSegmentationDetector: string;
    /** Given 3D segmentation. */
    segmentation3D: string;
    /** Photos and their orientation. */
    orientedPhotos: string;
    /** Object detector to analyze oriented photos. */
    photoObjectDetector: string;
    /** Given 2D objects. */
    objects2D: string;

    constructor() {
        /**
         * Collection of point clouds.
         * @type {string}
         */
        this.pointClouds = "";
        /**
         * Collection of meshes.
         * @type {string}
         */
        this.meshes = "";
        /**
         * Point cloud segmentation detector.
         * @type {string}
         */
        this.pointCloudSegmentationDetector = "";
        /**
         * Given 3D segmentation.
         * @type {string}
         */
        this.segmentation3D = "";
        /**
         * Photos and their orientation.
         * @type {string}
         */
        this.orientedPhotos = "";
        /**
         * Object detector to analyze oriented photos.
         * @type {string}
         */
        this.photoObjectDetector = "";
        /**
         * Given 2D objects.
         * @type {string}
         */
        this.objects2D = "";
    }
}

/**
 * Possible outputs for a Segmentation 3D job.
 */
class S3DOutputs {
    /** 3D segmentation computed by current job. */
    segmentation3D: string;
    /** 3D segmentation as an OPC file. */
    segmentedPointCloud: string;
    /** 2D objects detected by current job. */
    objects2D: string;
    /** 3D segmentation exported as a POD file. */
    exportedSegmentation3DPOD: string;
    /** 3D segmentation exported as a LAS file. */
    exportedSegmentation3DLAS: string;
    /** 3D segmentation exported as a LAZ file. */
    exportedSegmentation3DLAZ: string;
    /** 3D segmentation exported as a PLY file. */
    exportedSegmentation3DPLY: string;
    /** 3D objects inferred from 3D segmentation. */
    objects3D: string;
    /** DGN file export with 3D objects. */
    exportedObjects3DDGN: string;
    /** Cesium 3D Tiles file export with 3D objects. */
    exportedObjects3DCesium: string;
    /** ESRI SHP file export with locations of the 3D objects. */
    exportedLocations3DSHP: string;

    constructor() {
        /**
         * 3D segmentation computed by current job.
         * @type {string}
         */
        this.segmentation3D = "";
        /**
         * 3D segmentation as an OPC file.
         * @type {string}
         */
        this.segmentedPointCloud = "";
        /**
         * 2D objects detected by current job.
         * @type {string}
         */
        this.objects2D = "";
        /**
         * 3D segmentation exported as a POD file.
         * @type {string}
         */
        this.exportedSegmentation3DPOD = "";
        /**
         * 3D segmentation exported as a LAS file.
         * @type {string}
         */
        this.exportedSegmentation3DLAS = "";
        /**
         * 3D segmentation exported as a LAZ file.
         * @type {string}
         */
        this.exportedSegmentation3DLAZ = "";
        /**
         * 3D segmentation exported as a PLY file.
         * @type {string}
         */
        this.exportedSegmentation3DPLY = "";
        /**
         * 3D objects inferred from 3D segmentation.
         * @type {string}
         */
        this.objects3D = "";
        /**
         * DGN file export with 3D objects.
         * @type {string}
         */
        this.exportedObjects3DDGN = "";
        /**
         * Cesium 3D Tiles file export with 3D objects.
         * @type {string}
         */
        this.exportedObjects3DCesium = "";
        /**
         * ESRI SHP file export with locations of the 3D objects.
         * @type {string}
         */
        this.exportedLocations3DSHP = "";
    }
}

/**
 * Settings for Segmentation 3D jobs.
 */
export class S3DJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job settings. */
    inputs: S3DInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: S3DOutputs;
    /** If confidence is saved on output files or not. */
    saveConfidence: boolean;
    /** SRS used by exports. */
    exportSrs: string;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.S3D;
        /**
         * Possible inputs for this job settings.
         * @type {S3DInputs}
         */
        this.inputs = new S3DInputs();
        /**
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
         * @type {S3DOutputs}
         */
        this.outputs = new S3DOutputs();
        /**
         * If confidence is saved on output files or not.
         * @type {boolean}
         */
        this.saveConfidence = false;
        /**
         * SRS used by exports.
         * @type {string}
         */
        this.exportSrs = "";
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.pointClouds)
            json["inputs"].push({ "name": "pointClouds", "realityDataId": this.inputs.pointClouds });
        if (this.inputs.meshes)
            json["inputs"].push({ "name": "meshes", "realityDataId": this.inputs.meshes });
        if (this.inputs.pointCloudSegmentationDetector)
            json["inputs"].push({ "name": "pointCloudSegmentationDetector", "realityDataId": this.inputs.pointCloudSegmentationDetector });
        if (this.inputs.segmentation3D)
            json["inputs"].push({ "name": "segmentation3D", "realityDataId": this.inputs.segmentation3D });
        if (this.inputs.orientedPhotos)
            json["inputs"].push({ "name": "orientedPhotos", "realityDataId": this.inputs.orientedPhotos });
        if (this.inputs.photoObjectDetector)
            json["inputs"].push({ "name": "photoObjectDetector", "realityDataId": this.inputs.photoObjectDetector });
        if (this.inputs.objects2D)
            json["inputs"].push({ "name": "objects2D", "realityDataId": this.inputs.objects2D });
        json["outputs"] = [];
        if (this.outputs.segmentation3D)
            json["outputs"].push("segmentation3D");
        if (this.outputs.segmentedPointCloud)
            json["outputs"].push("segmentedPointCloud");
        if (this.outputs.objects2D)
            json["outputs"].push("objects2D");
        if (this.outputs.exportedSegmentation3DPOD)
            json["outputs"].push("exportedSegmentation3DPOD");
        if (this.outputs.exportedSegmentation3DLAS)
            json["outputs"].push("exportedSegmentation3DLAS");
        if (this.outputs.exportedSegmentation3DLAZ)
            json["outputs"].push("exportedSegmentation3DLAZ");
        if (this.outputs.exportedSegmentation3DPLY)
            json["outputs"].push("exportedSegmentation3DPLY");
        if (this.outputs.objects3D)
            json["outputs"].push("objects3D");
        if (this.outputs.exportedObjects3DDGN)
            json["outputs"].push("exportedObjects3DDGN");
        if (this.outputs.exportedObjects3DCesium)
            json["outputs"].push("exportedObjects3DCesium");
        if (this.outputs.exportedLocations3DSHP)
            json["outputs"].push("exportedLocations3DSHP");
        if (this.exportSrs)
            json["exportSrs"] = this.exportSrs;
        if (this.saveConfidence)
            json["saveConfidence"] = "true";

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {S3DJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<S3DJobSettings> {
        const newJobSettings = new S3DJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["name"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["realityDataId"];
            else if (input["name"] === "meshes")
                newJobSettings.inputs.meshes = input["realityDataId"];
            else if (input["name"] === "pointCloudSegmentationDetector")
                newJobSettings.inputs.pointCloudSegmentationDetector = input["realityDataId"];
            else if (input["name"] === "segmentation3D")
                newJobSettings.inputs.segmentation3D = input["realityDataId"];
            else if (input["name"] === "orientedPhotos")
                newJobSettings.inputs.orientedPhotos = input["realityDataId"];
            else if (input["name"] === "photoObjectDetector")
                newJobSettings.inputs.photoObjectDetector = input["realityDataId"];
            else if (input["name"] === "objects2D")
                newJobSettings.inputs.objects2D = input["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected input name" + input["name"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["name"] === "segmentation3D")
                newJobSettings.outputs.segmentation3D = output["realityDataId"];
            else if (output["name"] === "segmentedPointCloud")
                newJobSettings.outputs.segmentedPointCloud = output["realityDataId"];
            else if (output["name"] === "objects2D")
                newJobSettings.outputs.objects2D = output["realityDataId"];
            else if (output["name"] === "exportedSegmentation3DPOD")
                newJobSettings.outputs.exportedSegmentation3DPOD = output["realityDataId"];
            else if (output["name"] === "exportedSegmentation3DLAS")
                newJobSettings.outputs.exportedSegmentation3DLAS = output["realityDataId"];
            else if (output["name"] === "exportedSegmentation3DLAZ")
                newJobSettings.outputs.exportedSegmentation3DLAZ = output["realityDataId"];
            else if (output["name"] === "exportedSegmentation3DPLY")
                newJobSettings.outputs.exportedSegmentation3DPLY = output["realityDataId"];
            else if (output["name"] === "objects3D")
                newJobSettings.outputs.objects3D = output["realityDataId"];
            else if (output["name"] === "exportedObjects3DDGN")
                newJobSettings.outputs.exportedObjects3DDGN = output["realityDataId"];
            else if (output["name"] === "exportedObjects3DCesium")
                newJobSettings.outputs.exportedObjects3DCesium = output["realityDataId"];
            else if (output["name"] === "exportedLocations3DSHP")
                newJobSettings.outputs.exportedLocations3DSHP = output["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected output name" + output["name"]));
        }
        if ("saveConfidence" in settingsJson)
            newJobSettings.saveConfidence = JSON.parse(settingsJson["saveConfidence"]);
        if ("exportSrs" in settingsJson)
            newJobSettings.exportSrs = settingsJson["exportSrs"];

        return newJobSettings;
    }
}

/**
 * Possible inputs for a Line Detection 3D job.
 */
class L3DInputs {
    /** Collection of point clouds. */
    pointClouds: string;
    /** Collection of meshes. */
    meshes: string;
    /** Point cloud segmentation detector. */
    pointCloudSegmentationDetector: string;
    /** Given 3D segmentation. */
    segmentation3D: string;
    /** Photos and their orientation. */
    orientedPhotos: string;
    /** Segmentation detector to apply to oriented photos. */
    photoSegmentationDetector: string;
    /** Given 2D segmentation. */
    segmentation2D: string;

    constructor() {
        /**
         * Collection of point clouds.
         * @type {string}
         */
        this.pointClouds = "";
        /**
         * Collection of meshes.
         * @type {string}
         */
        this.meshes = "";
        /**
         * Point cloud segmentation detector.
         * @type {string}
         */
        this.pointCloudSegmentationDetector = "";
        /**
         * Given 3D segmentation.
         * @type {string}
         */
        this.segmentation3D = "";
        /**
         * Photos and their orientation.
         * @type {string}
         */
        this.orientedPhotos = "";
        /**
         * Segmentation detector to apply to oriented photos.
         * @type {string}
         */
        this.photoSegmentationDetector = "";
        /**
         * Given 2D segmentation.
         * @type {string}
         */
        this.segmentation2D = "";
    }
}

/**
 * Possible outputs for a Line Detection 3D job.
 */
class L3DOutputs {
    /** 3D segmentation performed by current job. */
    segmentation3D: string;
    /** 3D segmentation as an OPC file. */
    segmentedPointCloud: string;
    /** 2D segmentation performed by current job. */
    segmentation2D: string;
    /** Detected 3D lines. */
    lines3D: string;
    /** DGN file export with 3D lines. */
    exportedLines3DDGN: string;
    /** Cesium 3D Tiles file export with 3D lines. */
    exportedLines3DCesium: string;
    /** ContextScene pointing to segmented photos. */
    segmentedPhotos: string;

    constructor() {
        /**
         * 3D segmentation performed by current job.
         * @type {string}
         */
        this.segmentation3D = "";
        /**
         * 3D segmentation as an OPC file.
         * @type {string}
         */
        this.segmentedPointCloud = "";
        /**
         * 2D segmentation performed by current job.
         * @type {string}
         */
        this.segmentation2D = "";
        /**
         * ContextScene pointing to segmented photos.
         * @type {string}
         */
        this.segmentedPhotos = "";
        /**
         * Detected 3D lines.
         * @type {string}
         */
        this.lines3D = "";
        /**
         * DGN file export with 3D lines.
         * @type {string}
         */
        this.exportedLines3DDGN = "";
        /**
         * Cesium 3D Tiles file export with 3D lines.
         * @type {string}
         */
        this.exportedLines3DCesium = "";
    }
}

/**
 * Settings for Line Detection 3D jobs.
 */
export class L3DJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job settings. */
    inputs: L3DInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: L3DOutputs;
    /** Estimation 3D line width at each vertex. */
    computeLineWidth: boolean;
    /** Remove 3D lines with total length smaller than this value. */
    removeSmallComponents: number;
    /** SRS used by exports. */
    exportSrs: string;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.L3D;
        /**
         * Possible inputs for this job settings.
         * @type {L3DInputs}
         */
        this.inputs = new L3DInputs();
        /**
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
         * @type {L3DOutputs}
         */
        this.outputs = new L3DOutputs();
        /**
         * Estimation 3D line width at each vertex.
         * @type {boolean}
         */
        this.computeLineWidth = false;
        /**
         * Remove 3D lines with total length smaller than this value.
         * @type {number}
         */
        this.removeSmallComponents = 0;
        /**
         * SRS used by exports.
         * @type {string}
         */
        this.exportSrs = "";
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.pointClouds)
            json["inputs"].push({ "name": "pointClouds", "realityDataId": this.inputs.pointClouds });
        if (this.inputs.meshes)
            json["inputs"].push({ "name": "meshes", "realityDataId": this.inputs.meshes });
        if (this.inputs.pointCloudSegmentationDetector)
            json["inputs"].push({ "name": "pointCloudSegmentationDetector", "realityDataId": this.inputs.pointCloudSegmentationDetector });
        if (this.inputs.segmentation3D)
            json["inputs"].push({ "name": "segmentation3D", "realityDataId": this.inputs.segmentation3D });
        if (this.inputs.orientedPhotos)
            json["inputs"].push({ "name": "orientedPhotos", "realityDataId": this.inputs.orientedPhotos });
        if (this.inputs.photoSegmentationDetector)
            json["inputs"].push({ "name": "photoSegmentationDetector", "realityDataId": this.inputs.photoSegmentationDetector });
        if (this.inputs.segmentation2D)
            json["inputs"].push({ "name": "segmentation2D", "realityDataId": this.inputs.segmentation2D });
        json["outputs"] = [];
        if (this.outputs.segmentation3D)
            json["outputs"].push("segmentation3D");
        if (this.outputs.segmentedPointCloud)
            json["outputs"].push("segmentedPointCloud");
        if (this.outputs.segmentation2D)
            json["outputs"].push("segmentation2D");
        if(this.outputs.segmentedPhotos)
            json["outputs"].push("segmentedPhotos")
        if (this.outputs.lines3D)
            json["outputs"].push("lines3D");
        if (this.outputs.exportedLines3DDGN)
            json["outputs"].push("exportedLines3DDGN");
        if (this.outputs.exportedLines3DCesium)
            json["outputs"].push("exportedLines3DCesium");
        if (this.computeLineWidth)
            json["computeLineWidth"] = "true";
        if (this.removeSmallComponents)
            json["removeSmallComponents"] = this.removeSmallComponents.toString();
        if (this.exportSrs)
            json["exportSrs"] = this.exportSrs;
        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {L3DJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<L3DJobSettings> {
        const newJobSettings = new L3DJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["name"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["realityDataId"];
            else if (input["name"] === "meshes")
                newJobSettings.inputs.meshes = input["realityDataId"];
            else if (input["name"] === "pointCloudSegmentationDetector")
                newJobSettings.inputs.pointCloudSegmentationDetector = input["realityDataId"];
            else if (input["name"] === "segmentation3D")
                newJobSettings.inputs.segmentation3D = input["realityDataId"];
            else if (input["name"] === "orientedPhotos")
                newJobSettings.inputs.orientedPhotos = input["realityDataId"];
            else if (input["name"] === "photoSegmentationDetector")
                newJobSettings.inputs.photoSegmentationDetector = input["realityDataId"];
            else if (input["name"] === "segmentation2D")
                newJobSettings.inputs.segmentation2D = input["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected input name" + input["name"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["name"] === "segmentation3D")
                newJobSettings.outputs.segmentation3D = output["realityDataId"];
            else if (output["name"] === "segmentedPointCloud")
                newJobSettings.outputs.segmentedPointCloud = output["realityDataId"];
            else if (output["name"] === "segmentation2D")
                newJobSettings.outputs.segmentation2D = output["realityDataId"];
            else if(output["name"] === "segmentedPhotos")
                newJobSettings.outputs.segmentedPhotos = output["realityDataId"]
            else if (output["name"] === "lines3D")
                newJobSettings.outputs.lines3D = output["realityDataId"];
            else if (output["name"] === "exportedLines3DDGN")
                newJobSettings.outputs.exportedLines3DDGN = output["realityDataId"];
            else if (output["name"] === "exportedLines3DCesium")
                newJobSettings.outputs.exportedLines3DCesium = output["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected output name" + output["name"]));
        }
        if ("computeLineWidth" in settingsJson)
            newJobSettings.computeLineWidth = JSON.parse(settingsJson["computeLineWidth"]);
        if ("removeSmallComponents" in settingsJson)
            newJobSettings.removeSmallComponents = JSON.parse(settingsJson["removeSmallComponents"]);
        if ("exportSrs" in settingsJson)
            newJobSettings.exportSrs = settingsJson["exportSrs"];

        return newJobSettings;
    }
}

/**
 * Possible inputs for a  Change Detection job.
 */
class ChangeDetectionInputs {
    /** First collection of point clouds. */
    pointClouds1: string;
    /** Second collection of point clouds. */
    pointClouds2: string;
    /** First collection of meshes. */
    meshes1: string;
    /** Second collection of meshes. */
    meshes2: string;

    constructor() {
        /**
         * First collection of point clouds.
         * @type {string}
         */
        this.pointClouds1 = "";
        /**
         * Second collection of point clouds.
         * @type {string}
         */
        this.pointClouds2 = "";
        /**
         * First collection of meshes.
         * @type {string}
         */
        this.meshes1 = "";
        /**
         * Second collection of meshes.
         * @type {string}
         */
        this.meshes2 = "";
    }
}

/**
 * Possible outputs for a  Change Detection job.
 */
class ChangeDetectionOutputs {
    /** Regions with changes. */
    objects3D: string;
    /** ESRI SHP file export with locations of regions with changes. */
    exportedLocations3DSHP: string;

    constructor() {
        /**
         * Regions with changes.
         * @type {string}
         */
        this.objects3D = "";
        /**
         * ESRI SHP file export with locations of regions with changes.
         * @type {string}
         */
        this.exportedLocations3DSHP = "";
    }
}

/**
 * Settings for Change Detection jobs.
 */
export class ChangeDetectionJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job settings. */
    inputs: ChangeDetectionInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
     */
    outputs: ChangeDetectionOutputs;
    /** Low threshold to detect color changes (hysteresis detection). */
    colorThresholdLow: number;
    /** High threshold to detect color changes (hysteresis detection). */
    colorThresholdHigh: number;
    /** Low threshold to detect spatial changes (hysteresis detection). */
    distThresholdLow: number;
    /** High threshold to detect spatial changes (hysteresis detection). */
    distThresholdHigh: number;
    /** Target point cloud resolution when starting from meshes. */
    resolution: number;
    /** Minimum number of points in a region to be considered as a change. */
    minPoints: number;
    /** SRS used by exports. */
    exportSrs: string;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.ChangeDetection;
        /**
         * Possible inputs for this job settings.
         * @type {ChangeDetectionInputs}
         */
        this.inputs = new ChangeDetectionInputs();
        /**
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the name of the output) before passing it to createJob. 
         * @type {ChangeDetectionOutputs}
         */
        this.outputs = new ChangeDetectionOutputs();
        /**
         * Low threshold to detect color changes (hysteresis detection).
         * @type {number}
         */
        this.colorThresholdLow = 0.;
        /**
         * High threshold to detect color changes (hysteresis detection).
         * @type {number}
         */
        this.colorThresholdHigh = 0.;
        /**
         * Low threshold to detect spatial changes (hysteresis detection).
         * @type {number}
         */
        this.distThresholdLow = 0.;
        /**
         * High threshold to detect spatial changes (hysteresis detection).
         * @type {number}
         */
        this.distThresholdHigh = 0.;
        /**
         * Target point cloud resolution when starting from meshes.
         * @type {number}
         */
        this.resolution = 0.;
        /**
         * Minimum number of points in a region to be considered as a change.
         * @type {number}
         */
        this.minPoints = 0;
        /**
         * SRS used by exports.
         * @type {string}
         */
        this.exportSrs = "";
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.pointClouds1)
            json["inputs"].push({ "name": "pointClouds1", "realityDataId": this.inputs.pointClouds1 });
        if (this.inputs.pointClouds2)
            json["inputs"].push({ "name": "pointClouds2", "realityDataId": this.inputs.pointClouds2 });
        if (this.inputs.meshes1)
            json["inputs"].push({ "name": "meshes1", "realityDataId": this.inputs.meshes1 });
        if (this.inputs.meshes2)
            json["inputs"].push({ "name": "meshes2", "realityDataId": this.inputs.meshes2 });
        json["outputs"] = [];
        if (this.outputs.objects3D)
            json["outputs"].push("objects3D");
        if (this.outputs.exportedLocations3DSHP)
            json["outputs"].push("exportedLocations3DSHP");
        if (this.colorThresholdLow)
            json["colorThresholdLow"] = this.colorThresholdLow.toString();
        if (this.colorThresholdHigh)
            json["colorThresholdHigh"] = this.colorThresholdHigh.toString();
        if (this.distThresholdLow)
            json["distThresholdLow"] = this.distThresholdLow.toString();
        if (this.distThresholdHigh)
            json["distThresholdHigh"] = this.distThresholdHigh.toString();
        if (this.resolution)
            json["resolution"] = this.resolution.toString();
        if (this.minPoints)
            json["minPoints"] = this.minPoints.toString();
        if (this.exportSrs)
            json["exportSrs"] = this.exportSrs;
        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {ChangeDetectionJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<ChangeDetectionJobSettings> {
        const newJobSettings = new ChangeDetectionJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["name"] === "pointClouds1")
                newJobSettings.inputs.pointClouds1 = input["realityDataId"];
            else if (input["name"] === "pointClouds2")
                newJobSettings.inputs.pointClouds2 = input["realityDataId"];
            else if (input["name"] === "meshes1")
                newJobSettings.inputs.meshes1 = input["realityDataId"];
            else if (input["name"] === "meshes2")
                newJobSettings.inputs.meshes2 = input["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected input name" + input["name"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["name"] === "objects3D")
                newJobSettings.outputs.objects3D = output["realityDataId"];
            else if (output["name"] === "exportedLocations3DSHP")
                newJobSettings.outputs.exportedLocations3DSHP = output["realityDataId"];
            else
                return Promise.reject(new Error("Found non expected output name" + output["name"]));
        }
        if ("colorThresholdLow" in settingsJson)
            newJobSettings.colorThresholdLow = JSON.parse(settingsJson["colorThresholdLow"]);
        if ("colorThresholdHigh" in settingsJson)
            newJobSettings.colorThresholdHigh = JSON.parse(settingsJson["colorThresholdHigh"]);
        if ("distThresholdLow" in settingsJson)
            newJobSettings.distThresholdLow = JSON.parse(settingsJson["distThresholdLow"]);
        if ("distThresholdHigh" in settingsJson)
            newJobSettings.distThresholdHigh = JSON.parse(settingsJson["distThresholdHigh"]);
        if ("resolution" in settingsJson)
            newJobSettings.resolution = JSON.parse(settingsJson["resolution"]);
        if ("minPoints" in settingsJson)
            newJobSettings.minPoints = JSON.parse(settingsJson["minPoints"]);
        if ("exportSrs" in settingsJson)
            newJobSettings.exportSrs = settingsJson["exportSrs"];
        
        return newJobSettings;
    }
}

export type JobSettings = O2DJobSettings | S2DJobSettings | O3DJobSettings | S3DJobSettings | L3DJobSettings | ChangeDetectionJobSettings;
