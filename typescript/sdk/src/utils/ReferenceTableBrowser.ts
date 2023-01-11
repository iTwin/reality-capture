/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/**
 * Associate data local paths to RDS ids.
 */
export class ReferenceTableBrowser {
    /** Local path to cloud id. */
    private localToCloud: Map<string, string>;
    /** Cloud id to local path. */
    private cloudToLocal: Map<string, string>;

    public get entries() {
        return this.localToCloud;
    }

    constructor() {
        this.localToCloud = new Map();
        this.cloudToLocal = new Map();
    }

    /**
     * Open a file picker and save references. This file will be loaded next time to prevent reuploading the same data, see {@link load}.
     */
    public async save(): Promise<void> {
        const newHandle = await window.showSaveFilePicker();
        const writableStream = await newHandle.createWritable();
        let content = "";
        for (const [key, value] of this.localToCloud) {
            content += key + "," + value + "\n";
        }
        await writableStream.write(content);
        await writableStream.close();
    }

    /**
     * Load references from selected file. Open a file picker to select the reference file.
     */
    public async load(): Promise<void> {
        const pickerOpts = {
            types: [
                {
                    description: "Text",
                    accept: {
                        "text/*": [".txt"]
                    }
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false
        };

        const handles = await window.showOpenFilePicker(pickerOpts);
        if(!handles.length)
            return;
            
        const file = await handles[0].getFile();
        const content = await file.text();
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
     * @param localPath new entry local path.
     * @param cloudId new entry cloud id.
     * @returns true if the entry has been added successfully.
     */
    public addReference(localPath: string, cloudId: string): boolean {
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
     * Remove reference from the reference table.
     * @param localPath local path entry to remove.
     * @param cloudId cloud id entry to remove.
     * @returns true if the entry has been removed successfully in both maps.
     */
    public removeReference(localPath: string, cloudId: string): boolean {
        return this.localToCloud.delete(localPath) && this.cloudToLocal.delete(cloudId);
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
        if (!this.hasLocalPath(localPath)) {
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
        if (!this.hasCloudId(cloudId)) {
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
    public translateInputPath(inputPath: string): string {
        if (!inputPath.length)
            return "";

        return this.getCloudIdFromLocalPath(inputPath);
    }

    public translateOutputPath(path: string): string {
        /* if(path)
            return "<requested>"; */
        return path;
    }
}