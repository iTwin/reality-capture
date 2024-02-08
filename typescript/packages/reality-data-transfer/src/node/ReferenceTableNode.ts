/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as fs from "fs";
import path from "path";

/**
 * A bi-directional map of local data paths and their corresponding cloud ID.
 */
export class ReferenceTableNode {
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
     * @param {string} fileName target file.
     */
    public async save(fileName: string): Promise<void> {
        await fs.promises.mkdir(path.dirname(fileName), { recursive: true });

        const fileExist = async (): Promise<boolean> => {
            try {
                await fs.promises.access(fileName, fs.constants.F_OK);
            }
            catch (error: any) {
                return false;
            }
            return true;
        };

        const exist = await fileExist();
        if(exist)
            await fs.promises.truncate(fileName, 0); // Reset file

        for (const [key, value] of this.localToCloud) {
            await fs.promises.appendFile(fileName, key + "," + value + "\n");
        }
    }

    /**
     * Load references from {@link fileName}.
     * @param fileName references file to load.
     */
    public async load(fileName: string): Promise<void> {
        this.localToCloud = new Map();
        this.cloudToLocal = new Map();

        const content = await fs.promises.readFile(fileName);
        const lines = content.toString().replace(/\r\n/g, "\n").split("\n");
        for (const line of lines) {
            const [localPath, cloudId] = line.split(",");
            if (!localPath || !cloudId)
                continue;

            this.addReference(localPath, cloudId);
        }
    }

    /**
     * Add a new entry in the table.
     * @param {string} localPath new entry local path.
     * @param {string} cloudId new entry cloud id.
     * @returns {boolean} true if the entry has been added successfully.
     */
    public addReference(localPath: string, cloudId: string): boolean {
        localPath = localPath.replace(/\\/g, "/");
        if (this.localToCloud.has(localPath) && this.cloudToLocal.has(cloudId)) {
            if (this.localToCloud.get(localPath) === cloudId && this.cloudToLocal.get(cloudId) === localPath)
                console.log("Both " + localPath + " and " + cloudId + " already exist in table and are not mapped to each other");

            return false;
        }

        this.localToCloud.set(localPath, cloudId);
        this.cloudToLocal.set(cloudId, localPath);
        return true;
    }

    /**
     * Check if {@link localPath} exists in {@link localToCloud}.
     * @param {string} localPath local path to search in the reference table.
     * @returns {boolean} true if {@link localPath} exists in {@link localToCloud}.
     */
    public hasLocalPath(localPath: string): boolean {
        localPath = localPath.replace(/\\/g, "/");
        return this.localToCloud.has(localPath);
    }

    /**
     * Check if {@link cloudId} exists in {@link cloudToLocal}.
     * @param {string} cloudId local path to search in the reference table.
     * @returns {boolean} true if {@link cloudId} exists in {@link cloudToLocal}.
     */
    public hasCloudId(cloudId: string): boolean {
        return this.cloudToLocal.has(cloudId);
    }

    /**
     * Get cloud id from local path.
     * @param {string} localPath local path.
     * @returns {string} cloud id associated to {@link localPath}.
     */
    public getCloudIdFromLocalPath(localPath: string): string {
        localPath = localPath.replace(/\\/g, "/");
        if (!this.hasLocalPath(localPath)) {
            console.log("Could not find " + localPath + " in reference table");
            return "";
        }
        return this.localToCloud.get(localPath)!;
    }

    /**
     * Get local path from cloud id.
     * @param {string} cloudId cloud id.
     * @returns {string} local path associated to {@link cloudId}.
     */
    public getLocalPathFromCloudId(cloudId: string): string {
        if (!this.hasCloudId(cloudId)) {
            console.log("Could not find " + cloudId + " in reference table");
            return "";
        }
        return this.cloudToLocal.get(cloudId)!;
    }

    /**
     * Translate input path to cloud id.
     * @param {string} inputPath input path to translate.
     * @returns {string} input as cloud id.
     */
    public translateInputPath(inputPath: string): string {
        if (!inputPath.length)
            return "";

        return this.getCloudIdFromLocalPath(inputPath);
    }
}