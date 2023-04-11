import { JobDates, JobState } from "../CommonData";

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

    constructor() {
        /**
         * Either a boolean to indicate conversion type or a list of created OPC files ids.
         * @type {boolean | string[]}
         */
        this.opc = false;
    }
}

/**
 * Options for a Reality Conversion job.
 */
class RCOptions {
    /** Quantity of engines to be used by the job. */
    engines: number;

    constructor() {
        /**
         * Quantity of engines to be used by the job.
         * @type { number }
         */
        this.engines = 0;
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
        };

        this.inputs.las.forEach((id) => {
            json["inputs"].push({ "type": "LAS", "id": id });
        });

        this.inputs.laz.forEach((id) => {
            json["inputs"].push({ "type": "LAZ", "id": id });
        });

        this.inputs.ply.forEach((id) => {
            json["inputs"].push({ "type": "PLY", "id": id });
        });

        this.inputs.e57.forEach((id) => {
            json["inputs"].push({ "type": "E57", "id": id });
        });

        if (this.outputs.opc)
            json["outputs"].push("OPC");

        if(this.options) {
            if(this.options.engines)
                json["options"]["engines"] = this.options.engines;
            
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
                return Promise.reject(new Error("Found non expected input name" + input["type"]));
        }
        const outputsJson = settingsJson["outputs"];
        newJobSettings.outputs.opc = [];
        for (const output of outputsJson) {
            if (output["format"] === "OPC")
                newJobSettings.outputs.opc.push(output["id"]);
            else
                return Promise.reject(new Error("Found non expected output name" + console.log(JSON.stringify(output))));
        }

        if(settingsJson["options"]) {
            if(settingsJson["options"]["engines"])
                newJobSettings.options.engines = settingsJson["options"]["engines"];
            
        }

        return newJobSettings;
    }
}

/** Parameters for estimating job cost before its processing.
    EstimatedCost is filled when this object is returned by a function but should only be taken in consideration if you
    have updated parameters for estimation before by using the getJobEstimatedCost function. */
export class RCJobCostParameters {
    /** Gigapixels to be processed. */
    gigaPixels: number;
    /** Megapoints to be processed. */
    megaPoints: number;
    /** Estimated cost of the job. */
    estimatedCost: number;

    constructor() {
        /**
         * Gigapixels to be processed.
         * @type {number}
         */
        this.gigaPixels = 0;
        /**
         * Megapoints to be processed.
         * @type {number}
         */
        this.megaPoints = 0;
        /**
         * Estimated cost of the job.
         * @type {number}
         */
        this.estimatedCost = 0;
    }

    /**
     * Transform settings into json.
     * Doesn't save estimatedCost because it is not a parameter used to estimate cost.
     * @returns {any} json with cost parameters.
     */
    public toJson(): any {
        const json: any = {};

        if(this.gigaPixels)
            json["gigaPixels"] = this.gigaPixels;

        if(this.megaPoints)
            json["megaPoints"] = this.megaPoints;

        return json;
    }

    /**
     * Transform json received from cloud service into job cost parameters.
     * @param {any} settingsJson json with estimation parameters received from cloud service.
     * @returns {RCJobCostParameters} New RCJobCostEstimation object with actualized estimated cost..
     */
    public static async fromJson(settingsJson: any): Promise<RCJobCostParameters> {
        const newJobSettings = new RCJobCostParameters();
        if(settingsJson["gigaPixels"])
            newJobSettings.gigaPixels = settingsJson["gigaPixels"];

        if(settingsJson["megaPoints"])
            newJobSettings.megaPoints = settingsJson["megaPoints"];

        if(settingsJson["estimatedCost"])
            newJobSettings.estimatedCost = settingsJson["estimatedCost"];

        return newJobSettings;
    }
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