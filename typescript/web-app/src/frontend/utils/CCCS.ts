import { submitRequest } from "./ApiUtils";

function getCCCSBase(): string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/contextcapture/"; }

/**
 * Create a workspace for CCCS reconstruction job.
 * @param accessToken access token to allow the app to access the API.
 * @returns created workspace.
 */
async function createWorkspace (accessToken: string): Promise<string> {
    const res = await submitRequest("PrepareWorkspaceCCCS", accessToken, getCCCSBase() + "workspaces/", "POST", [201],
        {
            name: "CCCS sample app workspace",
            iTwinId: process.env.IMJS_PROJECT_ID,
        }
    );
    return res.workspace.id;
}

/**
 * Get the progress of @see {@link jobId}.
 * @param jobId requested job id.
 * @param accessToken access token to allow the app to access the API.
 * @return job progress 
 */
export async function getCCCSProgress(jobId: string, accessToken: string): Promise<any> {
    if (!jobId)
        return {state: "Prepare job", progress: "0"};

    // Necessary : cancelled jobs still returns "active" in /progress
    const resGetJob = await submitRequest(undefined, accessToken, getCCCSBase() + "jobs/" + jobId, "GET", [200]);
    if (resGetJob.job.state === "failed")
        return {state: "Failed", progress: ""};

    if (resGetJob.job.state === "cancelled")
        return {state: "Cancelled", progress: ""};

    const res = await submitRequest(undefined, accessToken, getCCCSBase() + "jobs/" + jobId + "/progress", "GET", [200]);
    if (res.jobProgress.state === "Active")
        console.log("PERCENT:", res.jobProgress.percentage, "; STEP:", res.jobProgress.step);
    else
        return {state: "Done", progress: "100"};

    return {state: res.jobProgress.step, progress: res.jobProgress.percentage};
}

/**
 * Run reconstruction job and return its id.
 * @param inputs reconstruction job inputs.
 * @param accessToken access token to allow the app to access the API.
 * @param isFull full or just reconstruction.
 * @returns created job id.
 */
export async function runReconstructionJob(inputs: Map<string, string>, accessToken: string, isFull: boolean): Promise<string> {
    const workspaceId = await createWorkspace(accessToken);
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

    //--- Create CCCS reconstruction job   
    const res = await submitRequest("CCCS reconstruction job creation", accessToken, getCCCSBase() + "jobs", "POST", [201],
        {
            type: jobType,
            name: "CCCS sample app reconstruction job",
            workspaceId: workspaceId,
            inputs: inputsJson,
            settings: {
                meshQuality: "Medium",
                processingEngines: 0,
                outputs: outputTypes
            }
        });
    const reconstructionJobId = res.job.id;

    //--- Submit job
    await submitRequest(`CCCS ${jobType} job submission`, accessToken, getCCCSBase() + "jobs/" + reconstructionJobId, "PATCH", [200],
        {
            state: "active"
        });

    return reconstructionJobId;
}

/**
 * Get reconstruction job output ids.
 * @param jobId job to get the result.
 * @param accessToken access token to allow the app to access the API.
 * @returns outputs ids.
 */
export async function getReconstructionResult(jobId: string, accessToken: string): Promise<string[]> {
    const res = await submitRequest("Get job result", accessToken, getCCCSBase() + "jobs/" + jobId, "GET", [200]);
    const outputIds: string[] = [];
    res.job.jobSettings.outputs.forEach((output: any) => {
        outputIds.push(output.id);
    });
    return outputIds;
}

/**
 * Cancel CCCS job @see {@link jobId}.
 * @param jobId job to cancel
 * @param accessToken access token to allow the app to access the API.
 */
export async function cancelCCCSJob(jobId: string, accessToken: string): Promise<void> {
    await submitRequest("CCCS job : cancel ", accessToken, getCCCSBase() + "jobs/" + jobId, "PATCH", [200],
        {
            state: "cancelled",
        });
}