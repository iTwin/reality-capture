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

        if (this.outputs.opc)
            json["outputs"].push("OPC");

        if (this.outputs.pnts)
            json["outputs"].push("PNTS");

        if(this.options) {
            if(this.options.engines)
                json["options"]["processingEngines"] = this.options.engines;
            if(this.options.merge)
                json["options"]["merge"] = this.options.merge;
            
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
            else
                return Promise.reject(new Error("Found unexpected input type : " + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        newJobSettings.outputs.opc = [];
        newJobSettings.outputs.pnts = [];
        for (const output of outputsJson) {
            if (output["type"] === "OPC")
                newJobSettings.outputs.opc.push(output["id"]);
            else if (output["type"] === "PNTS")
                newJobSettings.outputs.pnts.push(output["id"]);
            else
                return Promise.reject(new Error("Found unexpected output type : " + output["type"]));
        }

        if(settingsJson["options"]) {
            if(settingsJson["options"]["processingEngines"])
                newJobSettings.options.engines = settingsJson["options"]["processingEngines"];
            if(settingsJson["options"]["merge"])
                newJobSettings.options.merge = settingsJson["options"]["merge"];
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