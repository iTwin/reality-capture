/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AccessToken } from "@itwin/core-bentley";
import { ApiUtils } from "./ApiUtils";
import { BaseAppAccess } from "./BaseAppAccess";

export class ContextCaptureCloud extends BaseAppAccess {
    private _workspaceId = "";
    private reconstructionJobId = "";

    constructor(accessToken: AccessToken) {
        super(accessToken);
    }

    get workspaceId(): string { return this._workspaceId; }

    public getCCSBase(): string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/contextcapture/"; }

    /**
     * Create a workspace if @see {@link workspaceId} is undefined, and set it.
     * @param workspaceId current workspace id.
     */
    public async createWorkspaceCCS(workspaceId: string): Promise<void> {
        if (!workspaceId) {
            const res = await ApiUtils.SubmitRequest("PrepareWorkspaceCCS", this.headers, this.getCCSBase() + "workspaces/", "POST", [201],
                {
                    name: "CCS sample app workspace",
                    iTwinId: this.projectId,
                }
            ) as any;
            workspaceId = res.workspace.id;
        }
        this._workspaceId = workspaceId;
    }

    /**
     * Monitor current job of id @see {@link jobId} until it is finished. Display the progress in the console.
     * @param jobId job to monitor.
     */
    public async monitorJobCCS(jobId: string): Promise<void> {
        console.log("Monitoring job");
        let complete = false;

        while (!complete) {
            const res = await ApiUtils.SubmitRequest(undefined, this.headers, this.getCCSBase() + "jobs/" + jobId + "/progress", "GET", [200]) as any;
            console.log("PERCENT:", res.jobProgress.percentage, "; STEP:", res.jobProgress.step);
            if (res.jobProgress.state === "Active")
                await ApiUtils.Sleep(10000);
            else
                complete = true;
        }
    }

    /**
     * Monitor current job until it is finished. Display the result in the browser.
     * @return the progress, send back to the frontend as progress request response.
     */
    public async monitorJobCCSBrowser(): Promise<string[]> {
        await ApiUtils.Sleep(6000);
        if (!this.reconstructionJobId)
            return ["Prepare job", "0"];

        // Necessary : cancelled jobs still returns "active" in /progress
        const resGetJob = await ApiUtils.SubmitRequest(undefined, this.headers, this.getCCSBase() + "jobs/" + this.reconstructionJobId, "GET", [200]) as any;
        if (resGetJob.job.state === "failed")
            return ["Failed", ""];

        if (resGetJob.job.state === "cancelled")
            return ["Cancelled", ""];

        const res = await ApiUtils.SubmitRequest(undefined, this.headers, this.getCCSBase() + "jobs/" + this.reconstructionJobId + "/progress", "GET", [200]) as any;
        if (res.jobProgress.state === "Active")
            console.log("PERCENT:", res.jobProgress.percentage, "; STEP:", res.jobProgress.step);
        else
            return ["Done", "100"];

        return [res.jobProgress.step, res.jobProgress.percentage];
    }

    /**
     * Run reconstruction job and return the outputs.
     * @param isFull full or just reconstruction.
     * @param inputs job inputs.
     * @returns the outputs ids.
     */
    public async runReconstructionJobCCS(isFull: boolean, inputs: Map<string, string>): Promise<string[]> {
        await this.createWorkspaceCCS(this.workspaceId);
        this.reconstructionJobId = "";
        const jobType: string = isFull ? "Full" : "Reconstruction";
        const outputTypes: string[] = isFull ? ["CCOrientations", "Cesium 3D Tiles"] : ["Cesium 3D Tiles"];
        const inputsJson: any[] = [];

        // Create json from inputs map
        inputs.forEach((value: string, key: string) => {
            inputsJson.push({
                id: key,
                description: value
            });
        });

        //--- Create CCS reconstruction job   
        let res = await ApiUtils.SubmitRequest("CCS reconstruction job creation", this.headers, this.getCCSBase() + "jobs", "POST", [201],
            {
                type: jobType,
                name: "CCS sample app reconstruction job",
                workspaceId: this.workspaceId,
                inputs: inputsJson,
                settings: {
                    meshQuality: "Medium",
                    processingEngines: 0,
                    outputs: outputTypes
                }
            }) as any;
        console.log("CCS reconstruction job creation result: ", res.job.jobSettings.outputs);
        this.reconstructionJobId = res.job.id;

        //--- Add data for Job estimate - not necessary

        //--- Submit job
        res = await ApiUtils.SubmitRequest(`CCS ${jobType} job submission`, this.headers, this.getCCSBase() + "jobs/" + this.reconstructionJobId, "PATCH", [200],
            {
                state: "active"
            });
        console.log("CCS reconstruction job submission result: ", res.job);

        //--- Monitor calibration job
        await this.monitorJobCCS(this.reconstructionJobId);

        // Get job result
        res = await ApiUtils.SubmitRequest("Get job result", this.headers, this.getCCSBase() + "jobs/" + this.reconstructionJobId, "GET", [200]) as any;
        console.log(`CCS ${jobType} job result:`, res.job);

        const outputIds: string[] = [];
        res.job.jobSettings.outputs.forEach((output: any) => {
            outputIds.push(output.id);
        });
        return outputIds;
    }

    /**
     * Cancel the current job.
     */
    public async cancelJobCCS(): Promise<void> {
        if (!this.reconstructionJobId)
            return;

        await ApiUtils.SubmitRequest("CCS job : cancel ", this.headers, this.getCCSBase() + "jobs/" + this.reconstructionJobId, "PATCH", [200],
            {
                state: "cancelled",
            });
    }
}
