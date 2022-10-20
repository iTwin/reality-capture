import * as fs from "fs";
import path = require("path");

/**
 * Associate data local paths to RDS ids.
 */
export class ReferenceTable {
    /** Local path to cloud id. */
    private localToCloud: Map<string, string>;
    /** Cloud id to local path. */
    private cloudToLocal: Map<string, string>;

    constructor() {
        this.localToCloud = new Map();
        this.cloudToLocal = new Map();
    }

    /**
     * Save references in {@link fileName}. This file will be loaded next time to prevent reuploading the same data, see {@link load}.
     * @param fileName target file.
     * @returns true if the references have been saved successfully.
     */
    public save(fileName: string): void | Error {
        try {
            if(!fs.existsSync(path.dirname(fileName))) {
                fs.mkdirSync(path.dirname(fileName), { recursive: true });
            }
            
            // Reset file
            if(fs.existsSync(fileName))
                fs.truncateSync(fileName, 0);

            this.localToCloud.forEach((value: string, key: string) => {
                fs.appendFileSync(fileName, key + "," + value + "\n");
            });
        }
        catch(error: any) {
            return new Error("Could not save references " + path.dirname(fileName) + ": " + error);
        }
    }

    /**
     * Load references from {@link fileName}.
     * @param fileName target file.
     * @returns true if the references have been successfully loaded.
     */
    public load(fileName: string): void | Error {
        this.localToCloud = new Map();
        this.cloudToLocal = new Map();

        try {
            const content = fs.readFileSync(fileName);
            const lines = content.toString().replace(/\r\n/g,"\n").split("\n");
            
            let res = true;
            for(const line of lines) {
                const [localPath, cloudId] = line.split(",");
                if(!localPath || !cloudId)
                    continue;
                
                res &&= this.addReference(localPath, cloudId);
            }
        }
        catch(error: any) {
            return new Error("Could not load references " + path.dirname(fileName) + ": " + error);
        }
    }

    /**
     * Add a new entry in the table.
     * @param localPath new entry local path.
     * @param cloudId new entry cloud id.
     * @returns true if the entry has been added successfully.
     */
    public addReference(localPath: string, cloudId: string): boolean {
        if(this.localToCloud.has(localPath) && this.cloudToLocal.has(cloudId)) {
            if(this.localToCloud.get(localPath) === cloudId && this.cloudToLocal.get(cloudId) === localPath)
                console.log("Both " + localPath + " and " + cloudId + " already exist in table and are not mapped to each other");
            
            return false;
        }

        this.localToCloud.set(localPath, cloudId);
        this.cloudToLocal.set(cloudId, localPath);
        return true;
    }

    /**
     * Check if {@link localPath} exists in {@link localToCloud}.
     * @param localPath local path to search in the reference table.
     * @returns true if {@link localPath} exists in {@link localToCloud}.
     */
    public hasLocalPath(localPath: string): boolean {
        return this.localToCloud.has(localPath);
    }

    /**
     * Check if {@link cloudId} exists in {@link cloudToLocal}.
     * @param cloudId local path to search in the reference table.
     * @returns true if {@link cloudId} exists in {@link cloudToLocal}.
     */
    public hasCloudId(cloudId: string): boolean {
        return this.cloudToLocal.has(cloudId);
    }

    /**
     * Get cloud id from local path.
     * @param localPath local path.
     * @returns cloud id associated to {@link localPath}.
     */
    public getCloudIdFromLocalPath(localPath: string): string {
        if(!this.hasLocalPath(localPath)) {
            console.log("Could not find " + localPath + " in reference table");
            return "";
        }
        return this.localToCloud.get(localPath)!;
    }

    /**
     * Get local path from cloud id.
     * @param cloudId cloud id.
     * @returns local path associated to {@link cloudId}.
     */
    public getLocalPathFromCloudId(cloudId: string): string {
        if(!this.hasCloudId(cloudId)) {
            console.log("Could not find " + cloudId + " in reference table");
            return "";
        }
        return this.cloudToLocal.get(cloudId)!;
    }

    /**
     * Translate input path to cloud id.
     * @param inputPath input path to translate.
     * @returns input as cloud id.
     */
    private translateInputPath(inputPath: string): string {
        if(!inputPath.length)
            return "";

        return this.getCloudIdFromLocalPath(inputPath);
    }

    private translateOutputPath(path: string): string {
        /* if(path)
            return "<requested>"; */
        return path;
    }
}