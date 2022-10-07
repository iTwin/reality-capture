import { ContainerClient } from "@azure/storage-blob";
import { getRealityData, submitRequest } from "./ApiUtils";

function getRDASBase(): string { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydataanalysis/"; }

async function getNumberOfPhotos(contextScene: string, accessToken: string): Promise<number> {
    let numberOfPhotos = 0;
    const realityData = await getRealityData(contextScene, accessToken);
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
 * Run and monitor RDAS job.
 * @returns 
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
 * Run and monitor RDAS job.
 * @param jobId activate backend monitor.
 * @returns 
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
 * Monitor current job until it is finished. Display the result in the browser.
 * @return the progress, send back to the frontend as progress request response.
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

export async function cancelRDASJob(jobId: string, accessToken: string): Promise<void> {
    await submitRequest("RDAS job : cancel ", accessToken, getRDASBase() + "jobs/" + jobId, "PATCH", [200],
        {
            state: "cancelled",
        });
}