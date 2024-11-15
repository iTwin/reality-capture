/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/** Possible types of a job. */
export enum RDAJobType {
    NONE = "not recognized",
    O2D = "objects2D",
    S2D = "segmentation2D",
    SOrtho = "segmentationOrthophoto",
    S3D = "segmentation3D",
    ChangeDetection = "changeDetection",
    ExtractGround = "extractGround"
}

/**
 * Possible inputs for an Object 2D job.
 */
class O2DInputs {
    /** Path to ContextScene with oriented photos to analyze. */
    photos: string;
    /** Path to photo object detector to apply. */
    photoObjectDetector: string;
    /** Given 2D objects. */
    objects2D: string;
    /** Collection of point clouds. */
    pointClouds: string;
    /** Collection of meshes. */
    meshes: string;

    constructor() {
        /**
         * Path to ContextScene with oriented photos to analyze.
         * @type {string}
         */
        this.photos = "";
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
    }
}

/**
 * Possible outputs for an Object 2D job.
 */
class O2DOutputs {
    /** 2D objects detected by current job. */
    objects2D: string;
    /** Detected 3D objects.*/
    objects3D: string;
    /** DGN file export with 3D objects. */
    exportedObjects3DDGN: string;
    /** Cesium 3D Tiles file export with 3D objects. */
    exportedObjects3DCesium: string;
    /** GeoJSON file export with 3D objects. */
    exportedObjects3DGeoJSON: string;
    /** ESRI SHP file export with locations of the 3D objects. */
    exportedLocations3DSHP: string;
    /** GeoJSON file export with locations of the 3D objects. */
    exportedLocations3DGeoJSON: string;

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
         * GeoJSON file export with 3D objects.
         * @type {string}
         */
        this.exportedObjects3DGeoJSON = "";
        /**
         * ESRI SHP file export with locations of the 3D objects.
         * @type {string}
         */
        this.exportedLocations3DSHP = "";
        /**
         * GeoJSON file export with locations of the 3D objects.
         * @type {string}
         */
        this.exportedLocations3DGeoJSON = "";
    }
}

/**
 * Possible options for an Objects 2D job
 */
class O2DOptions {
    /** Improve detection using tie points in photos. */
    useTiePoints: boolean;
    /** Minimum number of 2D objects to generate a 3D object. */
    minPhotos: number;
    /** Maximum distance between photos and 3D objects. */
    maxDist: number;
    /** SRS used by exports. */
    exportSrs: string;

    constructor() {
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
}

/** Settings for Object Detection 2D jobs. */
export class O2DJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job. */
    inputs: O2DInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
     */
    outputs: O2DOutputs;
    /** Possible options for this job. */
    options: O2DOptions;

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
         * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
         * @type {O2DOutputs}
         */
        this.outputs = new O2DOutputs();
        /**
         * Possible options for this job.
         * @type {O2DOptions}
         */
        this.options = new O2DOptions();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.photos)
            json["inputs"].push({ "type": "photos", "id": this.inputs.photos });

        if (this.inputs.photoObjectDetector)
            json["inputs"].push({ "type": "photoObjectDetector", "id": this.inputs.photoObjectDetector });

        if (this.inputs.objects2D)
            json["inputs"].push({ "type": "objects2D", "id": this.inputs.objects2D });

        if (this.inputs.pointClouds)
            json["inputs"].push({ "type": "pointClouds", "id": this.inputs.pointClouds });

        if (this.inputs.meshes)
            json["inputs"].push({ "type": "meshes", "id": this.inputs.meshes });

        json["outputs"] = [];
        if (this.outputs.objects2D)
            json["outputs"].push("objects2D");

        if (this.outputs.objects3D)
            json["outputs"].push("objects3D");

        if (this.outputs.exportedObjects3DDGN)
            json["outputs"].push("exportedObjects3DDGN");

        if (this.outputs.exportedObjects3DCesium)
            json["outputs"].push("exportedObjects3DCesium");

        if (this.outputs.exportedObjects3DGeoJSON)
            json["outputs"].push("exportedObjects3DGeoJSON");

        if (this.outputs.exportedLocations3DSHP)
            json["outputs"].push("exportedLocations3DSHP");

        if (this.outputs.exportedLocations3DGeoJSON)
            json["outputs"].push("exportedLocations3DGeoJSON");

        json["options"] = {};
        if (this.options.useTiePoints)
            json["options"]["useTiePoints"] = "true";

        if (this.options.minPhotos)
            json["options"]["minPhotos"] = this.options.minPhotos.toString();

        if (this.options.maxDist)
            json["options"]["maxDist"] = this.options.maxDist.toString();

        if (this.options.exportSrs)
            json["options"]["exportSrs"] = this.options.exportSrs;

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
            if (input["type"] === "photos")
                newJobSettings.inputs.photos = input["id"];
            else if (input["type"] === "photoObjectDetector")
                newJobSettings.inputs.photoObjectDetector = input["id"];
            else if (input["type"] === "meshes")
                newJobSettings.inputs.meshes = input["id"];
            else if (input["type"] === "objects2D")
                newJobSettings.inputs.objects2D = input["id"];
            else if (input["type"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["id"];
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["type"] === "objects2D")
                newJobSettings.outputs.objects2D = output["id"];
            else if (output["type"] === "objects3D")
                newJobSettings.outputs.objects3D = output["id"];
            else if (output["type"] === "exportedObjects3DDGN")
                newJobSettings.outputs.exportedObjects3DDGN = output["id"];
            else if (output["type"] === "exportedObjects3DCesium")
                newJobSettings.outputs.exportedObjects3DCesium = output["id"];
            else if (output["type"] === "exportedObjects3DGeoJSON")
                newJobSettings.outputs.exportedObjects3DGeoJSON = output["id"];
            else if (output["type"] === "exportedLocations3DSHP")
                newJobSettings.outputs.exportedLocations3DSHP = output["id"];
            else if (output["type"] === "exportedLocations3DGeoJSON")
                newJobSettings.outputs.exportedLocations3DGeoJSON = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }
        if("options" in settingsJson) {
            const options = settingsJson["options"];
            if ("exportSrs" in options)
                newJobSettings.options.exportSrs = options["exportSrs"];
            if ("minPhotos" in options)
                newJobSettings.options.minPhotos = JSON.parse(options["minPhotos"]);
            if ("maxDist" in options)
                newJobSettings.options.maxDist = JSON.parse(options["maxDist"]);
            if ("useTiePoints" in options)
                newJobSettings.options.useTiePoints = JSON.parse(options["useTiePoints"]);
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
    /** Collection of point clouds. */
    pointClouds: string;
    /** Collection of meshes. */
    meshes: string;
    /** Given 2D segmentation. */
    segmentation2D: string;

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
         * Given 2D segmentation.
         * @type {string}
         */
        this.segmentation2D = "";
    }
}

/**
 * Settings for Segmentation 2D jobs.
 */
class S2DOutputs {
    /** Segmented photos. */
    segmentation2D: string;
    /** ContextScene pointing to segmented photos. */
    segmentedPhotos: string;
    /** Detected 3D lines. */
    lines3D: string;
    /** DGN file export with 3D lines. */
    exportedLines3DDGN: string;
    /** Cesium 3D Tiles file export with 3D lines. */
    exportedLines3DCesium: string;
    /** GeoJSON file export with 3D lines. */
    exportedLines3DGeoJSON: string;
    /** Detected polygons. */
    polygons3D: string;
    /** DGN file export with polygons. */
    exportedPolygons3DDGN: string;
    /** Cesium 3D Tiles file export with 3D polygons. */
    exportedPolygons3DCesium: string;
    /** GeoJSON file export with 3D polygons. */
    exportedPolygons3DGeoJSON: string;

    constructor() {
        /**
         * Segmented photos.
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
        /**
         * GeoJSON file export with 3D lines.
         * @type {string}
         */
        this.exportedLines3DGeoJSON = "";
        /**
         * Detected polygons.
         * @type {string}
         */
        this.polygons3D = "";
        /**
         * DGN file export with polygons.
         * @type {string}
         */
        this.exportedPolygons3DDGN = "";
        /**
         * Cesium 3D Tiles file export with 3D polygons.
         * @type {string}
         */
        this.exportedPolygons3DCesium = "";
        /**
         * GeoJSON file export with 3D polygons.
         * @type {string}
         */
        this.exportedPolygons3DGeoJSON = "";
    }
}

/**
 * Possible options for an Segmentation 2D job
 */
class S2DOptions {
    /** Estimation 3D line width at each vertex. */
    computeLineWidth: boolean;
    /** Remove 3D lines with total length smaller than this value. */
    removeSmallComponents: number;
    /** SRS used by exports. */
    exportSrs: string;
    /** Minimum number of photos with a same class for a 3D point to have its class set. */
    minPhotos: number;

    constructor() {
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
        /**
         * Minimum number of photos with a same class for a 3D point to have its class set.
         * @type {number}
         */
        this.minPhotos = 0;        
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
     * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob.
     */
    outputs: S2DOutputs;
    /** Possible options for this job. */
    options: S2DOptions;

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
        /**
         * Possible options for this job.
         * @type {S2DOptions}
         */
        this.options = new S2DOptions();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.photos)
            json["inputs"].push({ "type": "photos", "id": this.inputs.photos });

        if (this.inputs.photoSegmentationDetector)
            json["inputs"].push({ "type": "photoSegmentationDetector", "id": this.inputs.photoSegmentationDetector });

        if (this.inputs.meshes)
            json["inputs"].push({ "type": "meshes", "id": this.inputs.meshes });

        if (this.inputs.pointClouds)
            json["inputs"].push({ "type": "pointClouds", "id": this.inputs.pointClouds });

        if (this.inputs.segmentation2D)
            json["inputs"].push({ "type": "segmentation2D", "id": this.inputs.segmentation2D });

        json["outputs"] = [];
        if (this.outputs.segmentation2D)
            json["outputs"].push("segmentation2D");

        if(this.outputs.segmentedPhotos)
            json["outputs"].push("segmentedPhotos");

        if(this.outputs.lines3D)
            json["outputs"].push("lines3D");

        if(this.outputs.polygons3D)
            json["outputs"].push("polygons3D");

        if(this.outputs.exportedPolygons3DDGN)
            json["outputs"].push("exportedPolygons3DDGN");

        if(this.outputs.exportedPolygons3DCesium)
            json["outputs"].push("exportedPolygons3DCesium");

        if(this.outputs.exportedPolygons3DGeoJSON)
            json["outputs"].push("exportedPolygons3DGeoJSON");

        if(this.outputs.exportedLines3DCesium)
            json["outputs"].push("exportedLines3DCesium");

        if(this.outputs.exportedLines3DDGN)
            json["outputs"].push("exportedLines3DDGN");

        if(this.outputs.exportedLines3DGeoJSON)
            json["outputs"].push("exportedLines3DGeoJSON");

        json["options"] = {};
        if (this.options.computeLineWidth)
            json["options"]["computeLineWidth"] = "true";

        if (this.options.removeSmallComponents)
            json["options"]["removeSmallComponents"] = this.options.removeSmallComponents.toString();

        if (this.options.minPhotos)
            json["options"]["minPhotos"] = this.options.minPhotos.toString();
        
        if (this.options.exportSrs)
            json["options"]["exportSrs"] = this.options.exportSrs;

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
            if (input["type"] === "photos")
                newJobSettings.inputs.photos = input["id"];
            else if (input["type"] === "photoSegmentationDetector")
                newJobSettings.inputs.photoSegmentationDetector = input["id"];
            else if (input["type"] === "meshes")
                newJobSettings.inputs.meshes = input["id"];
            else if (input["type"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["id"];
            else if (input["type"] === "segmentation2D")
                newJobSettings.inputs.segmentation2D = input["id"];
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["type"] === "segmentation2D")
                newJobSettings.outputs.segmentation2D = output["id"];
            else if(output["type"] === "segmentedPhotos")
                newJobSettings.outputs.segmentedPhotos = output["id"];
            else if(output["type"] === "polygons3D")
                newJobSettings.outputs.polygons3D = output["id"];
            else if(output["type"] === "lines3D")
                newJobSettings.outputs.lines3D = output["id"];
            else if(output["type"] === "exportedPolygons3DDGN")
                newJobSettings.outputs.exportedPolygons3DDGN = output["id"];
            else if(output["type"] === "exportedPolygons3DCesium")
                newJobSettings.outputs.exportedPolygons3DCesium = output["id"];
            else if(output["type"] === "exportedPolygons3DGeoJSON")
                newJobSettings.outputs.exportedPolygons3DGeoJSON = output["id"];
            else if(output["type"] === "exportedLines3DDGN")
                newJobSettings.outputs.exportedLines3DDGN = output["id"];
            else if(output["type"] === "exportedLines3DCesium")
                newJobSettings.outputs.exportedLines3DCesium = output["id"];
            else if(output["type"] === "exportedLines3DGeoJSON")
                newJobSettings.outputs.exportedLines3DGeoJSON = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }
        if("options" in settingsJson) {
            const options = settingsJson["options"];
            if ("exportSrs" in options)
                newJobSettings.options.exportSrs = options["exportSrs"];
            if ("minPhotos" in options)
                newJobSettings.options.minPhotos = JSON.parse(options["minPhotos"]);
            if ("computeLineWidth" in options)
                newJobSettings.options.computeLineWidth = JSON.parse(options["computeLineWidth"]);
            if ("removeSmallComponents" in options)
                newJobSettings.options.removeSmallComponents = JSON.parse(options["removeSmallComponents"]);
        }

        return newJobSettings;
    }
}

/**
 * Possible inputs for a Segmentation Ortho job.
 */
class SOrthoInputs {
    /** Path to orthophoto to analyse. */
    orthophoto: string;
    /** Path to orthophoto segmentation detector to apply. */
    orthophotoSegmentationDetector: string;

    constructor() {
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
 * Possible outputs for a Segmentation Ortho job.
 */
class SOrthoOutputs {
    /** Segmented photos. */
    segmentation2D: string;
    /** ContextScene pointing to segmented photos. */
    segmentedPhotos: string;
    /** Detected 2D polygons. */
    polygons2D: string;
    /** 2D polygons exported to ESRI shapefile. */
    exportedPolygons2DSHP: string;
    /** 2D polygons exported to GeoJSON file. */
    exportedPolygons2DGeoJSON: string;
    /** Detected 2D lines. */
    lines2D: string;
    /** 2D lines exported to ESRI shapefile. */
    exportedLines2DSHP: string;
    /** 2D lines exported to DGN file. */
    exportedLines2DDGN: string;
    /** 2D lines exported to GeoJSON file. */
    exportedLines2DGeoJSON: string;

    constructor() {
        /**
         * Segmented photos.
         * @type {string}
         */
        this.segmentation2D = "";
        /**
         * ContextScene pointing to segmented photos.
         * @type {string}
         */
        this.segmentedPhotos = "";
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
         * 2D polygons exported to GeoJSON file.
         * @type {string}
         */
        this.exportedPolygons2DGeoJSON = "";
        /**
         * Detected 2D lines.
         * @type {string}
         */
        this.lines2D = "";
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
        /**
         * 2D lines exported to GeoJSON file.
         * @type {string}
         */
        this.exportedLines2DGeoJSON = "";
    }
}

/**
 * Settings for Segmentation Ortho jobs.
 */
export class SOrthoJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job. */
    inputs: SOrthoInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob.
     */
    outputs: SOrthoOutputs;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.SOrtho;
        /**
         * Possible inputs for this job.
         * @type {SOrthoInputs}
         */
        this.inputs = new SOrthoInputs();
        /**
         * Possible outputs for this job.
         * @type {SOrthoOutputs}
         */
        this.outputs = new SOrthoOutputs();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.orthophoto)
            json["inputs"].push({ "type": "orthophoto", "id": this.inputs.orthophoto });

        if (this.inputs.orthophoto)
            json["inputs"].push({ "type": "orthophotoSegmentationDetector", "id": this.inputs.orthophotoSegmentationDetector });

        json["outputs"] = [];
        if (this.outputs.segmentation2D)
            json["outputs"].push("segmentation2D");

        if(this.outputs.segmentedPhotos)
            json["outputs"].push("segmentedPhotos");

        if(this.outputs.polygons2D)
            json["outputs"].push("polygons2D");

        if(this.outputs.lines2D)
            json["outputs"].push("lines2D");

        if(this.outputs.exportedPolygons2DSHP)
            json["outputs"].push("exportedPolygons2DSHP");

        if(this.outputs.exportedPolygons2DGeoJSON)
            json["outputs"].push("exportedPolygons2DGeoJSON");

        if(this.outputs.exportedLines2DSHP)
            json["outputs"].push("exportedLines2DSHP");

        if(this.outputs.exportedLines2DDGN)
            json["outputs"].push("exportedLines2DDGN");

        if(this.outputs.exportedLines2DGeoJSON)
            json["outputs"].push("exportedLines2DGeoJSON");

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {SOrthoJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<SOrthoJobSettings> {
        const newJobSettings = new SOrthoJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["type"] === "orthophoto")
                newJobSettings.inputs.orthophoto = input["id"];
            else if (input["type"] === "orthophotoSegmentationDetector")
                newJobSettings.inputs.orthophotoSegmentationDetector = input["id"];
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["type"] === "segmentation2D")
                newJobSettings.outputs.segmentation2D = output["id"];
            else if(output["type"] === "segmentedPhotos")
                newJobSettings.outputs.segmentedPhotos = output["id"];
            else if(output["type"] === "polygons2D")
                newJobSettings.outputs.polygons2D = output["id"];
            else if(output["type"] === "lines2D")
                newJobSettings.outputs.lines2D = output["id"];
            else if(output["type"] === "exportedPolygons2DSHP")
                newJobSettings.outputs.exportedPolygons2DSHP = output["id"];
            else if(output["type"] === "exportedPolygons2DGeoJSON")
                newJobSettings.outputs.exportedPolygons2DGeoJSON = output["id"];
            else if(output["type"] === "exportedLines2DSHP")
                newJobSettings.outputs.exportedLines2DSHP = output["id"];
            else if(output["type"] === "exportedLines2DDGN")
                newJobSettings.outputs.exportedLines2DDGN = output["id"];
            else if(output["type"] === "exportedLines2DGeoJSON")
                newJobSettings.outputs.exportedLines2DGeoJSON = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }

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
    /** Path of clipping polygon to apply. */
    clipPolygon: string;

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
         * Path of clipping polygon to apply.
         * @type {string}
         */
        this.clipPolygon = "";
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
    /** GeoJSON file export with 3D objects. */
    exportedObjects3DGeoJSON: string;
    /** ESRI SHP file export with locations of the 3D objects. */
    exportedLocations3DSHP: string;
    /** GeoJSON file export with locations of the 3D objects. */
    exportedLocations3DGeoJSON: string;
    /** Detected 3D lines. */
    lines3D: string;
    /** DGN file export with 3D lines. */
    exportedLines3DDGN: string;
    /** Cesium 3D Tiles file export with 3D lines. */
    exportedLines3DCesium: string;
    /** Cesium GeoJSON file export with 3D lines. */
    exportedLines3DGeoJSON: string;
    /** Detected polygons. */
    polygons3D: string;
    /** DGN file export with polygons. */
    exportedPolygons3DDGN: string;
    /** Cesium 3D Tiles file export with 3D polygons. */
    exportedPolygons3DCesium: string;
    /** GeoJSON file export with 3D polygons. */
    exportedPolygons3DGeoJSON: string;

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
         * GeoJSON file export with 3D objects.
         * @type {string}
         */
        this.exportedObjects3DGeoJSON = "";
        /**
         * ESRI SHP file export with locations of the 3D objects.
         * @type {string}
         */
        this.exportedLocations3DSHP = "";
        /**
         * GeoJSON file export with locations of the 3D objects.
         * @type {string}
         */
        this.exportedLocations3DGeoJSON = "";
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
        /**
         * GeoJSON file export with 3D lines.
         * @type {string}
         */
        this.exportedLines3DGeoJSON = "";
        /**
         * Detected polygons.
         * @type {string}
         */
        this.polygons3D = "";
        /**
         * DGN file export with polygons.
         * @type {string}
         */
        this.exportedPolygons3DDGN = "";
        /**
         * Cesium 3D Tiles file export with 3D polygons.
         * @type {string}
         */
        this.exportedPolygons3DCesium = "";
        /**
         * GeoJSON file export with 3D polygons.
         * @type {string}
         */
        this.exportedPolygons3DGeoJSON = "";
    }
}

/**
 * Possible options for an Segmentation 3D job
 */
class S3DOptions {
    /** If confidence is saved in 3D segmentation files or not. */
    saveConfidence: boolean;
    /** Estimation 3D line width at each vertex. */
    computeLineWidth: boolean;
    /** Remove 3D lines with total length smaller than this value. */
    removeSmallComponents: number;
    /** SRS used by exports. */
    exportSrs: string;    

    constructor() {
        /**
         * If confidence is saved on output files or not.
         * @type {boolean}
         */
        this.saveConfidence = false;
        /**
         * Estimation 3D line width at each vertex.
         * @type {boolean}
         */
        this.computeLineWidth = false;
        /**
         * Remove 3D lines with total length smaller than this value.
         * @type {boolean}
         */
        this.removeSmallComponents = 0;
        /**
         * SRS used by exports.
         * @type {string}
         */
        this.exportSrs = "";              
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
     * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
     */
    outputs: S3DOutputs;
    /** Possible options for this job. */
    options: S3DOptions;

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
         * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
         * @type {S3DOutputs}
         */
        this.outputs = new S3DOutputs();
        /**
         * Possible options for this job.
         * @type {S3DOptions}
         */
        this.options = new S3DOptions();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.pointClouds)
            json["inputs"].push({ "type": "pointClouds", "id": this.inputs.pointClouds });

        if (this.inputs.meshes)
            json["inputs"].push({ "type": "meshes", "id": this.inputs.meshes });
        
        if (this.inputs.pointCloudSegmentationDetector)
            json["inputs"].push({ "type": "pointCloudSegmentationDetector", "id": this.inputs.pointCloudSegmentationDetector });
        
        if (this.inputs.segmentation3D)
            json["inputs"].push({ "type": "segmentation3D", "id": this.inputs.segmentation3D });

        if (this.inputs.clipPolygon)
            json["inputs"].push({ "type": "clipPolygon", "id": this.inputs.clipPolygon });
        
        json["outputs"] = [];
        if (this.outputs.segmentation3D)
            json["outputs"].push("segmentation3D");

        if (this.outputs.segmentedPointCloud)
            json["outputs"].push("segmentedPointCloud");

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

        if (this.outputs.exportedObjects3DGeoJSON)
            json["outputs"].push("exportedObjects3DGeoJSON");

        if (this.outputs.exportedLocations3DSHP)
            json["outputs"].push("exportedLocations3DSHP");

        if (this.outputs.exportedLocations3DGeoJSON)
            json["outputs"].push("exportedLocations3DGeoJSON");

        if (this.outputs.exportedLines3DDGN)
            json["outputs"].push("exportedLines3DDGN");

        if (this.outputs.exportedLines3DCesium)
            json["outputs"].push("exportedLines3DCesium");

        if (this.outputs.exportedLines3DGeoJSON)
            json["outputs"].push("exportedLines3DGeoJSON");

        if (this.outputs.polygons3D)
            json["outputs"].push("polygons3D");

        if (this.outputs.lines3D)
            json["outputs"].push("lines3D");

        if (this.outputs.exportedPolygons3DDGN)
            json["outputs"].push("exportedPolygons3DDGN");

        if (this.outputs.exportedPolygons3DCesium)
            json["outputs"].push("exportedPolygons3DCesium");

        if (this.outputs.exportedPolygons3DGeoJSON)
            json["outputs"].push("exportedPolygons3DGeoJSON");
        
        json["options"] = {};
        if (this.options.exportSrs)
            json["options"]["exportSrs"] = this.options.exportSrs;

        if (this.options.saveConfidence)
            json["options"]["saveConfidence"] = "true";

        if (this.options.removeSmallComponents)
            json["options"]["removeSmallComponents"] = this.options.removeSmallComponents.toString();

        if (this.options.computeLineWidth)
            json["options"]["computeLineWidth"] = "true";

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
            if (input["type"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["id"];
            else if (input["type"] === "meshes")
                newJobSettings.inputs.meshes = input["id"];
            else if (input["type"] === "pointCloudSegmentationDetector")
                newJobSettings.inputs.pointCloudSegmentationDetector = input["id"];
            else if (input["type"] === "segmentation3D")
                newJobSettings.inputs.segmentation3D = input["id"];
            else if (input["type"] === "clipPolygon")
                newJobSettings.inputs.clipPolygon = input["id"];
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["type"] === "segmentation3D")
                newJobSettings.outputs.segmentation3D = output["id"];
            else if (output["type"] === "segmentedPointCloud")
                newJobSettings.outputs.segmentedPointCloud = output["id"];
            else if (output["type"] === "exportedSegmentation3DPOD")
                newJobSettings.outputs.exportedSegmentation3DPOD = output["id"];
            else if (output["type"] === "exportedSegmentation3DLAS")
                newJobSettings.outputs.exportedSegmentation3DLAS = output["id"];
            else if (output["type"] === "exportedSegmentation3DLAZ")
                newJobSettings.outputs.exportedSegmentation3DLAZ = output["id"];
            else if (output["type"] === "exportedSegmentation3DPLY")
                newJobSettings.outputs.exportedSegmentation3DPLY = output["id"];
            else if (output["type"] === "objects3D")
                newJobSettings.outputs.objects3D = output["id"];
            else if (output["type"] === "exportedObjects3DDGN")
                newJobSettings.outputs.exportedObjects3DDGN = output["id"];
            else if (output["type"] === "exportedObjects3DCesium")
                newJobSettings.outputs.exportedObjects3DCesium = output["id"];
            else if (output["type"] === "exportedObjects3DGeoJSON")
                newJobSettings.outputs.exportedObjects3DGeoJSON = output["id"];
            else if (output["type"] === "exportedLocations3DSHP")
                newJobSettings.outputs.exportedLocations3DSHP = output["id"];
            else if (output["type"] === "exportedLocations3DGeoJSON")
                newJobSettings.outputs.exportedLocations3DGeoJSON = output["id"];
            else if (output["type"] === "exportedLines3DDGN")
                newJobSettings.outputs.exportedLines3DDGN = output["id"];
            else if (output["type"] === "exportedLines3DCesium")
                newJobSettings.outputs.exportedLines3DCesium = output["id"];
            else if (output["type"] === "exportedLines3DGeoJSON")
                newJobSettings.outputs.exportedLines3DGeoJSON = output["id"];
            else if (output["type"] === "polygons3D")
                newJobSettings.outputs.polygons3D = output["id"];
            else if (output["type"] === "lines3D")
                newJobSettings.outputs.lines3D = output["id"];
            else if (output["type"] === "exportedPolygons3DDGN")
                newJobSettings.outputs.exportedPolygons3DDGN = output["id"];
            else if (output["type"] === "exportedPolygons3DCesium")
                newJobSettings.outputs.exportedPolygons3DCesium = output["id"];
            else if (output["type"] === "exportedPolygons3DGeoJSON")
                newJobSettings.outputs.exportedPolygons3DGeoJSON = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }
        if("options" in settingsJson) {
            const options = settingsJson["options"];
            if ("saveConfidence" in options)
                newJobSettings.options.saveConfidence = JSON.parse(options["saveConfidence"]);
            
            if ("exportSrs" in options)
                newJobSettings.options.exportSrs = options["exportSrs"];

            if ("removeSmallComponents" in options)
                newJobSettings.options.removeSmallComponents = JSON.parse(options["removeSmallComponents"]);

            if ("computeLineWidth" in options)
                newJobSettings.options.computeLineWidth = JSON.parse(options["computeLineWidth"]);
        }

        return newJobSettings;
    }
}

/**
 * Possible inputs for an Extract Ground job.
 */
class ExtractGroundInputs {
    /** Collection of point clouds. */
    pointClouds: string;
    /** Collection of meshes. */
    meshes: string;
    /** Point cloud segmentation detector. */
    pointCloudSegmentationDetector: string;
    /** Path of clipping polygon to apply. */
    clipPolygon: string;

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
         * Path of clipping polygon to apply.
         * @type {string}
         */
        this.clipPolygon = "";
    }
}

/**
 * Possible outputs for an Extract Ground Detection job.
 */
class ExtractGroundOutputs {
    /** Ground segmentation computed by current job. */
    segmentation3D: string;
    /** 3D ground segmentation as an OPC file. */
    segmentedPointCloud: string;
    /** 3D ground segmentation exported as a POD file. */
    exportedSegmentation3DPOD: string;
    /** 3D ground segmentation exported as a LAS file. */
    exportedSegmentation3DLAS: string;
    /** 3D ground segmentation exported as a LAZ file. */
    exportedSegmentation3DLAZ: string;

    constructor() {
        /**
         * Ground segmentation computed by current job.
         * @type {string}
         */
        this.segmentation3D = "";
        /**
         * 3D ground segmentation as an OPC file.
         * @type {string}
         */
        this.segmentedPointCloud = "";
        /**
         * 3D ground segmentation exported as a POD file.
         * @type {string}
         */
        this.exportedSegmentation3DPOD = "";
        /**
         * 3D ground segmentation exported as a LAS file.
         * @type {string}
         */
        this.exportedSegmentation3DLAS = "";
        /**
         * 3D ground segmentation exported as a LAZ file.
         * @type {string}
         */
        this.exportedSegmentation3DLAZ = "";
    }
}

/**
 * Possible options for an Extract Ground job
 */
class ExtractGroundOptions {
    /** SRS used by exports. */
    exportSrs: string;    

    constructor() {
        /**
         * SRS used by exports.
         * @type {string}
         */
        this.exportSrs = "";
    }
}

/**
 * Settings for Extract ground jobs.
 */
export class ExtractGroundJobSettings {
    /** Type of job settings. */
    type: RDAJobType;
    /** Possible inputs for this job settings. */
    inputs: ExtractGroundInputs;
    /** 
     * Possible outputs for this job. 
     * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
     */
    outputs: ExtractGroundOutputs;
    /** Possible options for this job. */
    options: ExtractGroundOptions;

    constructor() {
        /**
         * Type of job settings.
         * @type {RDAJobType}
         */
        this.type = RDAJobType.ExtractGround;
        /**
         * Possible inputs for this job settings.
         * @type {ExtractGroundInputs}
         */
        this.inputs = new ExtractGroundInputs();
        /**
         * Possible outputs for this job. 
         * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
         * @type {ExtractGroundOutputs}
         */
        this.outputs = new ExtractGroundOutputs();
        /**
         * Possible options for this job.
         * @type {ExtractGroundOptions}
         */
        this.options = new ExtractGroundOptions();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.pointClouds)
            json["inputs"].push({ "type": "pointClouds", "id": this.inputs.pointClouds });

        if (this.inputs.meshes)
            json["inputs"].push({ "type": "meshes", "id": this.inputs.meshes });

        if (this.inputs.pointCloudSegmentationDetector)
            json["inputs"].push({ "type": "pointCloudSegmentationDetector", "id": this.inputs.pointCloudSegmentationDetector });

        if (this.inputs.clipPolygon)
            json["inputs"].push({ "type": "clipPolygon", "id": this.inputs.clipPolygon });

        json["outputs"] = [];
        if (this.outputs.segmentation3D)
            json["outputs"].push("segmentation3D");

        if (this.outputs.segmentedPointCloud)
            json["outputs"].push("segmentedPointCloud");

        if (this.outputs.exportedSegmentation3DPOD)
            json["outputs"].push("exportedSegmentation3DPOD");

        if (this.outputs.exportedSegmentation3DLAS)
            json["outputs"].push("exportedSegmentation3DLAS");

        if (this.outputs.exportedSegmentation3DLAZ)
            json["outputs"].push("exportedSegmentation3DLAZ");

        json["options"] = {};
        if (this.options.exportSrs)
            json["options"]["exportSrs"] = this.options.exportSrs;
        
        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {ExtractGroundJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<ExtractGroundJobSettings> {
        const newJobSettings = new ExtractGroundJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["type"] === "pointClouds")
                newJobSettings.inputs.pointClouds = input["id"];
            else if (input["type"] === "meshes")
                newJobSettings.inputs.meshes = input["id"];
            else if (input["type"] === "pointCloudSegmentationDetector")
                newJobSettings.inputs.pointCloudSegmentationDetector = input["id"];
            else if (input["type"] === "clipPolygon")
                newJobSettings.inputs.clipPolygon = input["id"];
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["type"] === "segmentation3D")
                newJobSettings.outputs.segmentation3D = output["id"];
            else if (output["type"] === "segmentedPointCloud")
                newJobSettings.outputs.segmentedPointCloud = output["id"];
            else if (output["type"] === "exportedSegmentation3DPOD")
                newJobSettings.outputs.exportedSegmentation3DPOD = output["id"];
            else if (output["type"] === "exportedSegmentation3DLAZ")
                newJobSettings.outputs.exportedSegmentation3DLAZ = output["id"];
            else if (output["type"] === "exportedSegmentation3DLAS")
                newJobSettings.outputs.exportedSegmentation3DLAS = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }
        if("options" in settingsJson) {
            const options = settingsJson["options"];
            if ("exportSrs" in options)
                newJobSettings.options.exportSrs = options["exportSrs"];
        }
        
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
    /** GeoJSON file export with locations of regions with changes. */
    exportedLocations3DGeoJSON: string;

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
        /**
         * GeoJSON file export with locations of regions with changes.
         * @type {string}
         */
        this.exportedLocations3DGeoJSON = "";
    }
}

/**
 * Possible options for a Change Detection job
 */
class ChangeDetectionOptions {
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
     * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
     */
    outputs: ChangeDetectionOutputs;
    /** Possible options for this job. */
    options: ChangeDetectionOptions;

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
         * Fill the outputs you want for the job with a string (normally the type of the output) before passing it to createJob. 
         * @type {ChangeDetectionOutputs}
         */
        this.outputs = new ChangeDetectionOutputs();
        /**
         * Possible options for this job.
         * @type {ChangeDetectionOptions}
         */
        this.options = new ChangeDetectionOptions();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {};
        json["inputs"] = [];
        if (this.inputs.pointClouds1)
            json["inputs"].push({ "type": "pointClouds1", "id": this.inputs.pointClouds1 });

        if (this.inputs.pointClouds2)
            json["inputs"].push({ "type": "pointClouds2", "id": this.inputs.pointClouds2 });

        if (this.inputs.meshes1)
            json["inputs"].push({ "type": "meshes1", "id": this.inputs.meshes1 });

        if (this.inputs.meshes2)
            json["inputs"].push({ "type": "meshes2", "id": this.inputs.meshes2 });

        json["outputs"] = [];
        if (this.outputs.objects3D)
            json["outputs"].push("objects3D");

        if (this.outputs.exportedLocations3DSHP)
            json["outputs"].push("exportedLocations3DSHP");

        if (this.outputs.exportedLocations3DGeoJSON)
            json["outputs"].push("exportedLocations3DGeoJSON");

        json["options"] = {};
        if (this.options.colorThresholdLow)
            json["options"]["colorThresholdLow"] = this.options.colorThresholdLow.toString();

        if (this.options.colorThresholdHigh)
            json["options"]["colorThresholdHigh"] = this.options.colorThresholdHigh.toString();

        if (this.options.distThresholdLow)
            json["options"]["distThresholdLow"] = this.options.distThresholdLow.toString();

        if (this.options.distThresholdHigh)
            json["options"]["distThresholdHigh"] = this.options.distThresholdHigh.toString();

        if (this.options.resolution)
            json["options"]["resolution"] = this.options.resolution.toString();

        if (this.options.minPoints)
            json["options"]["minPoints"] = this.options.minPoints.toString();

        if (this.options.exportSrs)
            json["options"]["exportSrs"] = this.options.exportSrs;
        
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
            if (input["type"] === "pointClouds1")
                newJobSettings.inputs.pointClouds1 = input["id"];
            else if (input["type"] === "pointClouds2")
                newJobSettings.inputs.pointClouds2 = input["id"];
            else if (input["type"] === "meshes1")
                newJobSettings.inputs.meshes1 = input["id"];
            else if (input["type"] === "meshes2")
                newJobSettings.inputs.meshes2 = input["id"];
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        for (const output of outputsJson) {
            if (output["type"] === "objects3D")
                newJobSettings.outputs.objects3D = output["id"];
            else if (output["type"] === "exportedLocations3DSHP")
                newJobSettings.outputs.exportedLocations3DSHP = output["id"];
            else if (output["type"] === "exportedLocations3DGeoJSON")
                newJobSettings.outputs.exportedLocations3DGeoJSON = output["id"];
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }
        if("options" in settingsJson) {
            const options = settingsJson["options"];
            if ("colorThresholdLow" in options)
                newJobSettings.options.colorThresholdLow = JSON.parse(options["colorThresholdLow"]);
            if ("colorThresholdHigh" in options)
                newJobSettings.options.colorThresholdHigh = JSON.parse(options["colorThresholdHigh"]);
            if ("distThresholdLow" in options)
                newJobSettings.options.distThresholdLow = JSON.parse(options["distThresholdLow"]);
            if ("distThresholdHigh" in options)
                newJobSettings.options.distThresholdHigh = JSON.parse(options["distThresholdHigh"]);
            if ("resolution" in options)
                newJobSettings.options.resolution = JSON.parse(options["resolution"]);
            if ("minPoints" in options)
                newJobSettings.options.minPoints = JSON.parse(options["minPoints"]);
            if ("exportSrs" in options)
                newJobSettings.options.exportSrs = options["exportSrs"];
        }
        
        return newJobSettings;
    }
}

export type JobSettings = O2DJobSettings | S2DJobSettings | S3DJobSettings | 
    ChangeDetectionJobSettings | ExtractGroundJobSettings | SOrthoJobSettings;