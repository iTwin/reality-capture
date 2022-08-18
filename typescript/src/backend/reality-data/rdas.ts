/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AccessToken } from "@itwin/core-bentley";
import { ApiUtils } from "./ApiUtils";
import { BaseAppAccess } from "./BaseAppAccess";

export class RealityDataAnalysis extends BaseAppAccess
{
    private currentJobId = "";

    constructor(accessToken : AccessToken) 
    {
        super(accessToken);
    }

    protected getRDASBase() : string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydataanalysis/"; }

    /**
     * Monitor current job until it is finished. Display the progress in the console.
     */
    public async monitorJobRDAS()
    {
        console.log("Monitoring job");
        let complete = false;
        while(!complete)
        {
            const res = await ApiUtils.SubmitRequest(undefined, this.headers, this.getRDASBase() + "jobs/" + this.currentJobId + "/progress", "GET", [200]) as any;
            console.log("PERCENT:", res.progress.percentage, "; STEP:", res.progress.step);
            if (res.progress.state == "active")
                await ApiUtils.Sleep(10000);
            else
                complete = true;
        }
    }

    /**
     * Monitor current job until it is finished. Display the result in the browser.
     * @return the progress, send back to the frontend as progress request response.
     */
    public async monitorJobRDASBrowser(): Promise<string[]>
    {
        await ApiUtils.Sleep(6000);
        if(!this.currentJobId)
            return ["Prepare job", "0"];

        // Necessary : cancelled jobs still returns "active" in /progress
        const resGetJob = await ApiUtils.SubmitRequest(undefined, this.headers, this.getRDASBase() + "jobs/" + this.currentJobId, "GET", [200]) as any;
        if(resGetJob.job.state === "failed")
            return ["Failed", ""];

        if(resGetJob.job.state === "cancelled")
            return ["Cancelled", ""];
        
        const res = await ApiUtils.SubmitRequest(undefined, this.headers, this.getRDASBase() + "jobs/" + this.currentJobId + "/progress", "GET", [200]) as any;
        if (res.progress.state == "active")
            console.log("PERCENT:", res.progress.percentage, "; STEP:", res.progress.step);           
        else
            return ["Done", "100"];

        return [res.progress.step, res.progress.percentage];
    }

    /**
     * Run and monitor RDAS job.
     * @param backendMonitor activate backend monitor.
     * @param inputs job inputs.
     * @param outputTypes job outputs types
     * @param type job type (currently lines3d, objects2d and segmentation2d)
     * @param numberOfPhotos number of photos to process
     * @returns 
     */
    public async runJobRDAS(backendMonitor: boolean, inputs: Map<string, string>, outputTypes: string[], type: string, numberOfPhotos: number): Promise<string[]>
    {
        console.log("RunJobRDAS");

        // Transform map to json
        const inputsJson: any[] = [];
        inputs.forEach((value: string, key: string) => {
            inputsJson.push({
                name: key,
                realityDataId : value
            });
        });

        // Create RDAS job
        let res = await ApiUtils.SubmitRequest("RDAS job creation", this.headers, this.getRDASBase() + "jobs", "POST", [201],
            {
                name : "RDAS sample app",
                iTwinId : this.projectId,
                type : type,
                settings : {
                    inputs: inputsJson,
                    outputs : outputTypes
                }
            }) as any;

        // Add data for job cost estimate
        await ApiUtils.SubmitRequest("RDAS job : add cost estimate ", this.headers, this.getRDASBase() + "jobs/" + res.job.id, "PATCH", [200],
            {
                costEstimationParameters: {
                    numberOfPhotos,
                    gigaPixels: 1,
                }
            });

        // Submit job
        await ApiUtils.SubmitRequest("RDAS job submission", this.headers, this.getRDASBase() + "jobs/" + res.job.id, "PATCH", [200],
            {
                state: "active"
            });

        this.currentJobId = res.job.id;

        // Monitor job
        if(backendMonitor)
            await this.monitorJobRDAS();

        // Get job result
        res = await ApiUtils.SubmitRequest("Get job result", this.headers, this.getRDASBase() + "jobs/" + this.currentJobId, "GET", [200]) as any;
        
        const outputIds: string[] = [];
        res.job.settings.outputs.forEach((output: any) => {
            outputIds.push(output.realityDataId);
        });
        return outputIds;
    }

    /**
     * Cancel the current job.
     */
    public async cancelJobRDAS(): Promise<void>
    {
        if(!this.currentJobId)
            return;

        await ApiUtils.SubmitRequest("RDAS job : cancel ", this.headers, this.getRDASBase() + "jobs/" + this.currentJobId, "PATCH", [200],
            {
                state: "cancelled",
            });
    }
}

