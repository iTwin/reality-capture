import { JobDates, JobState } from "@itwin/reality-capture-common";

/** Possible types of Reality Conversion job. */
export enum RCJobType {
    Conversion  = "Conversion",
    None = "None"
}

/**
 * Inputs for a Reality Conversion job.
 */
class RCInputs {
    /** A list of paths to LAS files. */
    las: string[];
    /** A list of paths to LAZ files. */
    laz: string[];
    /** A list of paths to PLY files. */
    ply: string[];
    /** A list of paths to E57 files. */
    e57: string[];
    /** A list of paths to POD files. */
    pointcloud: string[];
    /** A list of paths to OPC files. */
    opc: string[];
    /** A list of paths to PNTS files. */
    pnts: string[];

    constructor() {
        /**
         * A list of paths to LAS files.
         * @type {string[]}
         */
        this.las = [];
        /**
         * A list of paths to LAZ files.
         * @type {string[]}
         */
        this.laz = [];
        /**
         * A list of paths to PLY files.
         * @type {string[]}
         */
        this.ply = [];
        /**
         * A list of paths to E57 files.
         * @type {string[]}
         */
        this.e57 = [];
        /**
         * A list of paths to POD files.
         * @type {string[]}
         */
        this.pointcloud = [];
        /**
         * A list of paths to OPC files.
         * @type {string[]}
         */
        this.opc = [];
        /**
         * A list of paths to PNTS files.
         * @type {string[]}
         */
        this.pnts = [];
    }
}

/**
 * Outputs for a Reality Conversion job.
 */
class RCOuputs {
    /** Either a boolean to indicate conversion type or a list of created OPC files ids. */
    opc: boolean | string[];

    /** Either a boolean to indicate conversion type or a list of created PNTS files ids. */
    pnts: boolean | string[];

    /** Either a boolean to indicate conversion type or a list of created GLB files ids. */
    glb: boolean | string[];

    /** Either a boolean to indicate conversion type or a list of created GLBC files ids. */
    glbc: boolean | string[];

    constructor() {
        /**
         * Either a boolean to indicate conversion type or a list of created OPC files ids.
         * @type {boolean | string[]}
         */
        this.opc = false;

        /**
         * Either a boolean to indicate conversion type or a list of created PNTS files ids.
         * @type {boolean | string[]}
         */
        this.pnts = false;

        /**
         * Either a boolean to indicate conversion type or a list of created GLB files ids.
         * @type {boolean | string[]}
         */
        this.glb = false;

        /**
         * Either a boolean to indicate conversion type or a list of created GLBC files ids.
         * @type {boolean | string[]}
         */
        this.glbc = false;
    }
}

/**
 * Options for a Reality Conversion job.
 */
class RCOptions {
    /** Quantity of engines to be used by the job. */
    engines: number;
    /** If true, all the input files from multiple containers will be merged into one output file. Else output file will be created per input file. */
    merge: boolean;
    /** Defines the horizontal or horizontal+vertical EPSG codes of the CRS (coordinate reference system) of the input files. */
    inputSrs: string;
    /** Defines the horizontal or horizontal+vertical EPSG codes of the CRS (coordinate reference system) of the output files. */
    outputSrs: string;

    constructor() {
        /**
         * Quantity of engines to be used by the job.
         * @type { number }
         */
        this.engines = 0;

        /** If true, all the input files from multiple containers will be merged into one output file. Else output file will be created per input file. 
         * @type { boolean }
         */
        this.merge = false;

        /** Defines the horizontal or horizontal+vertical EPSG codes of the CRS (coordinate reference system) of the input files.
         * @type { string }
         */
        this.inputSrs = "";

        /** Defines the horizontal or horizontal+vertical EPSG codes of the CRS (coordinate reference system) of the output files. 
         * @type { string }
         */
        this.outputSrs = "";
    }
}

/** Settings for Reality Conversion jobs. */
export class RCJobSettings {
    /** Possible inputs for this job. Lists of inputs ids in the cloud, divided by type of data. */
    inputs: RCInputs;
    /** Possible outputs for this job. Fill the types of outputs you want for the job with True before passing the settings to createJob. */
    outputs: RCOuputs;
    /** Possible options for this job. */
    options: RCOptions;

    constructor() {
        /**
         * Possible inputs for this job. Lists of inputs ids in the cloud, divided by type of data.
         * @type {RCInputs}
         */
        this.inputs = new RCInputs();
        /** 
         * Possible outputs for this job. Fill the types of outputs you want for the job with True before passing the settings to createJob.
         * @type {RCOuputs}
         */
        this.outputs = new RCOuputs();
        /** 
         * Possible options for this job.
         * @type {RCOptions}
         */
        this.options = new RCOptions();
    }

    /**
     * Transform settings into json.
     * @returns {any} json with settings values.
     */
    public toJson(): any {
        const json: any = {
            "inputs": [],
            "outputs": [],
            "options": {
                "processingEngines": this.options.engines,
                "merge" : this.options.merge,
                "inputSRS" : this.options.inputSrs,
                "outputSRS" : this.options.outputSrs,
            }
        };

        this.inputs.las.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        this.inputs.laz.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        this.inputs.ply.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        this.inputs.e57.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        this.inputs.opc.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        this.inputs.pnts.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        this.inputs.pointcloud.forEach((id) => {
            json["inputs"].push({ "id": id });
        });

        if (this.outputs.opc)
            json["outputs"].push("OPC");

        if (this.outputs.pnts)
            json["outputs"].push("PNTS");

        if (this.outputs.glb)
            json["outputs"].push("GLB");

        if (this.outputs.glbc)
            json["outputs"].push("GLBC");

        if(this.options) {
            if(this.options.engines)
                json["options"]["processingEngines"] = this.options.engines;
            if(this.options.merge)
                json["options"]["merge"] = this.options.merge;
            if(this.options.inputSrs)
                json["options"]["inputSRS"] = this.options.inputSrs;
            if(this.options.outputSrs)
                json["options"]["outputSRS"] = this.options.outputSrs;
            
        }

        return json;
    }

    /**
     * Transform json received from cloud service into settings.
     * @param {any} settingsJson Dictionary with settings received from cloud service.
     * @returns {RCJobSettings} New settings.
     */
    public static async fromJson(settingsJson: any): Promise<RCJobSettings> {
        const newJobSettings = new RCJobSettings();
        const inputsJson = settingsJson["inputs"];
        for (const input of inputsJson) {
            if (input["type"] === "LAS")
                newJobSettings.inputs.las.push(input["id"]);
            else if (input["type"] === "LAZ")
                newJobSettings.inputs.laz.push(input["id"]);
            else if (input["type"] === "PLY")
                newJobSettings.inputs.ply.push(input["id"]);
            else if (input["type"] === "E57")
                newJobSettings.inputs.e57.push(input["id"]);
            else if (input["type"] === "OPC")
                newJobSettings.inputs.opc.push(input["id"]);
            else if (input["type"] === "PNTS")
                newJobSettings.inputs.pnts.push(input["id"]);
            else if (input["type"] === "PointCloud")
                newJobSettings.inputs.pointcloud.push(input["id"]);
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        newJobSettings.outputs.opc = [];
        newJobSettings.outputs.pnts = [];
        newJobSettings.outputs.glb = [];
        newJobSettings.outputs.glbc = [];
        for (const output of outputsJson) {
            if (output["type"] === "OPC")
                newJobSettings.outputs.opc.push(output["id"]);
            else if (output["type"] === "PNTS")
                newJobSettings.outputs.pnts.push(output["id"]);
            else if (output["type"] === "GLB")
                newJobSettings.outputs.glb.push(output["id"]);
            else if (output["type"] === "GLBC")
                newJobSettings.outputs.glbc.push(output["id"]);
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }

        if(settingsJson["options"]) {
            if(settingsJson["options"]["processingEngines"])
                newJobSettings.options.engines = settingsJson["options"]["processingEngines"];
            if(settingsJson["options"]["merge"])
                newJobSettings.options.merge = settingsJson["options"]["merge"];
            if(settingsJson["options"]["inputSRS"])
                newJobSettings.options.inputSrs = settingsJson["options"]["inputSRS"];
            if(settingsJson["options"]["outputSRS"])
                newJobSettings.options.outputSrs = settingsJson["options"]["outputSRS"];
        }

        return newJobSettings;
    }
}

/** Parameters for estimating job cost before its processing.
    EstimatedCost is filled when this object is returned by a function but should only be taken in consideration if you
    have updated parameters for estimation before by using the getJobEstimatedCost function. */
export interface RCJobCostParameters {
    /** Gigapixels to be processed. */
    gigaPixels?: number;
    /** Megapoints to be processed. */
    megaPoints?: number;
    /** Estimated cost of the job. */
    estimatedCost?: number;
}

/**
 * Properties of a job.
 * Convenience class to stock all properties of a job in a simple way.
 */
export interface RCJobProperties {
    id: string;
    name: string;
    type: RCJobType;
    settings: RCJobSettings;
    iTwinId: string;
    state?: JobState;
    dateTime?: JobDates;
    estimatedUnit?: number;
    dataCenter?: string;
    email?: string;
    costEstimationParameters?: RCJobCostParameters;
}