import { ContainerClient } from "@azure/storage-blob";
import { getRealityData, submitRequest } from "./ApiUtils";

function getRDASBase(): string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydataanalysis/"; }

/**
 * Get number of photos in the context scene
 * @param contextSceneId id of the context scene.
 * @param accessToken access token to allow the app to access the API.
 * @returns number of photos.
 */
async function getNumberOfPhotos(contextSceneId: string, accessToken: string): Promise<number> {
    let numberOfPhotos = 0;
    const realityData = await getRealityData(contextSceneId, accessToken);
    const blobUrl = await realityData.getBlobUrl(accessToken, "", true);
    const containerClient = new ContainerClient(blobUrl.toString());

    const iter = await containerClient.listBlobsFlat();
    for await (const blob of iter) 
    {
        if(blob.name === "ContextScene.xml") {
            const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
            const blobBody = await blobContent.blobBody;
            if(!blobBody)
                throw new Error("getNumberOfPhotos : can't retrieve context scene blob body.");

            const text = await blobBody.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const images = xmlDoc.getElementsByTagName("ImagePath");
            numberOfPhotos = images.length;
        }
    }
    return numberOfPhotos;
}

/**
 * Run RDA job and returns its id.
 * @param rdasJobType job type (O2D, S2D, L3D).
 * @param inputs job inputs.
 * @param outputTypes job requested outputs.
 * @param accessToken access token to allow the app to access the API.
 * @returns created job id.
 */
export async function runRDASJob(rdasJobType: string, inputs: Map<string, string>, outputTypes: string[], accessToken: string): Promise<string> {
    console.log("RunJobRDAS");
    let numberOfPhotos = 0;
    const sceneId = inputs.get("photos") ?? inputs.get("orientedPhotos");
    if(sceneId)
        numberOfPhotos = await getNumberOfPhotos(sceneId, accessToken); 
    
    // Transform map to json
    const inputsJson: any[] = [];
    inputs.forEach((value: string, key: string) => {
        inputsJson.push({
            name: key,
            realityDataId : value
        });
    });

    // Create RDAS job
    const res = await submitRequest("RDAS job creation", accessToken, getRDASBase() + "jobs", "POST", [201],
        {
            name : "RDAS sample app",
            iTwinId : process.env.IMJS_PROJECT_ID,
            type: rdasJobType,
            settings : {
                inputs: inputsJson,
                outputs : outputTypes
            }
        });

    // Add data for job cost estimate
    await submitRequest("RDAS job : add cost estimate ", accessToken, getRDASBase() + "jobs/" + res.job.id, "PATCH", [200],
        {
            costEstimationParameters: {
                numberOfPhotos,
                gigaPixels: 1,
            }
        });

    // Submit job
    await submitRequest("RDAS job submission", accessToken, getRDASBase() + "jobs/" + res.job.id, "PATCH", [200],
        {
            state: "active"
        });

    return res.job.id;
}

/**
 * Run RDA job output ids.
 * @param jobId job to get the result.
 * @param accessToken access token to allow the app to access the API.
 * @returns output ids.
 */
export async function getRDASResult(jobId: string, accessToken: string): Promise<string[]> {
    // Get job result
    const res = await submitRequest("Get job result", accessToken, getRDASBase() + "jobs/" + jobId, "GET", [200]);
     
    const outputIds: string[] = [];
    res.job.settings.outputs.forEach((output: any) => {
        outputIds.push(output.realityDataId);
    });
    return outputIds;
}

/**
 * Get the progress of @see {@link jobId}.
 * @param jobId requested job id.
 * @param accessToken access token to allow the app to access the API.
 * @return job progress. 
 */
export async function getRDASProgress(jobId: string, accessToken: string): Promise<any> {
    if(!jobId)
        return {state: "Prepare job", progress: "0"};

    // Necessary : cancelled jobs still returns "active" in /progress
    const resGetJob = await submitRequest(undefined, accessToken, getRDASBase() + "jobs/" + jobId, "GET", [200]);
    if(resGetJob.job.state === "failed")
        return {state: "Failed", progress: ""};

    if(resGetJob.job.state === "cancelled")
        return {state: "Cancelled", progress: ""};
     
    const res = await submitRequest(undefined, accessToken, getRDASBase() + "jobs/" + jobId + "/progress", "GET", [200]);
    if (res.progress.state == "active")
        console.log("PERCENT:", res.progress.percentage, "; STEP:", res.progress.step);           
    else
        return {state: "Done", progress: "100"};

    return {state: res.progress.step, progress: res.progress.percentage};
}

/**
 * Cancel RDA job @see {@link jobId}.
 * @param jobId job to cancel
 * @param accessToken access token to allow the app to access the API.
 */
export async function cancelRDASJob(jobId: string, accessToken: string): Promise<void> {
    await submitRequest("RDAS job : cancel ", accessToken, getRDASBase() + "jobs/" + jobId, "PATCH", [200],
        {
            state: "cancelled",
        });
}