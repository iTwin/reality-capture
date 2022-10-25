import { ContextCaptureService } from "./Cccs/Service";
import { CCJobType } from "./Cccs/Utils";
import { RealityDataAnalysisService } from "./Rdas/Service";
import { O2DJobSettings } from "./Rdas/Settings";
import { RealityDataTransfer } from "./Utils/RealityDataTransfer";
import { ReferenceTable } from "./Utils/ReferenceTable";


async function main() {
    // ----------RDAS---------------

    /*const service = new RealityDataAnalysisService("https://qa-api.bentley.com/realitydataanalysis/", "service-pJ0wfNZEIWcpVD98kt4QuHqQy", 
        "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg=="); */
    
    // cancel job
    //await service.cancelJob("1c9e7c6e-23a7-4616-ae89-d66f972d58ef"); 
    // const test = await service.deleteJob("100b81d9-4247-4a98-86d0-248d78af789b"); 

    /* let settings = new O2DJobSettings();
    settings.inputs.photos = "17503eed-3f9a-42d3-9e5d-3a03710424cd";
    settings.inputs.photoObjectDetector = "e5f4f6c4-d99f-4db9-8a37-eb98a6b3ea68";
    settings.outputs.objects2D = "objects2D";
    const id = await service.createJob(settings, "test", "ad14b27c-91ea-4492-9433-1e2d6903b5e4");
    if(id instanceof Error) {
        console.log("error : ", id);
        return;
    }

    const costParameters = {numberOfPhotos: 6, gigaPixels: 1};
    const costEstimation = service.getJobEstimatedCost(id, costParameters);
    console.log("costEstimation: ", costEstimation);

    const res = await service.submitJob(id);
    if(res instanceof Error)
        console.log("error2: ", res);
    
    const properties = await service.getJobProperties(id);
    console.log("props : ", properties); */
    

    // ----------RDS Utils---------------

    /* const dataTransfer = new RealityDataTransfer("https://qa-api.bentley.com/realitydata/", 
        "service-pJ0wfNZEIWcpVD98kt4QuHqQy", 
        "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg=="); */

    /* const response = await dataTransfer.uploadRealityData("D:\\O2D-Motos\\images", "O2Dsdk", RealityDataType.CC_IMAGE_COLLECTION, "ad14b27c-91ea-4492-9433-1e2d6903b5e4");
    if(response instanceof Error)
        console.log("error upload");
    else {
        const response2 = await dataTransfer.downloadRealityData(response, "D:\\output");
        console.log("response: ", response2);
    } */

    /* const response =  await dataTransfer.uploadContextScene("D:\\O2D-Motos\\Scene", "test upload scene sdk", "ad14b27c-91ea-4492-9433-1e2d6903b5e4");
    if(response instanceof Error)
        console.log("error : ", response);
    else {
        const response2 = await dataTransfer.downloadContextScene(response, "D:\\output");
        if(response2 instanceof Error)
            console.log("download response : ", response2);
    } */

    /* const refs = new ReferenceTable();
    refs.addReference("D:\\O2D-Motos\\images", "3a095348-5a5f-4bcd-a93c-3f24151c7e93");
    const response =  await dataTransfer.uploadContextScene("D:\\O2D-Motos\\Scene", "test upload scene sdk (with refs)", 
        "ad14b27c-91ea-4492-9433-1e2d6903b5e4", refs);
    if(response instanceof Error)
        console.log("error : ", response);
    else {
        const response2 = await dataTransfer.downloadContextScene(response, "D:\\output", refs);
        if(response2 instanceof Error)
            console.log("download response : ", response2);
    } */


    const service = new ContextCaptureService("https://qa-api.bentley.com/contextcapture/", "service-pJ0wfNZEIWcpVD98kt4QuHqQy", 
        "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg==");
    await service.connect();

    await service.cancelJob("1db330e1-09c3-4ce1-8cb7-b3b5850b6173");
    const response = await service.getJobProgress("1db330e1-09c3-4ce1-8cb7-b3b5850b6173");
    console.log("progress : ", response);

    /* const workspaceId = await service.createWorkspace("test workspace sdk", "ad14b27c-91ea-4492-9433-1e2d6903b5e4");
    if(workspaceId instanceof Error) {
        console.log("error while creating workspace");
        return;
    }
    console.log("id : ", workspaceId);
    let settings = new CCJobSettings();
    settings.inputs = ["c5da636f-4f9d-480f-b4fc-3aa1f7d1acaf",  "9b110a00-ccbd-4fc0-8b85-4101c967183d"];
    settings.outputs.threeMX = "threeMX";
    const jobId = await service.createJob(CCJobType.FULL, settings, "Test CCCS SDK", workspaceId, "ad14b27c-91ea-4492-9433-1e2d6903b5e4");
    if(jobId instanceof Error) {
        console.log("error while creating cccs job : " + jobId);
        return;
    }
    console.log("id : ", jobId);
    const err = await service.submitJob(jobId);
    if(err instanceof Error) {
        console.log("error while submiting cccs job : " + err);
        return;
    }
    console.log("job submitted");

    const props = await service.getJobProperties(jobId);
    if(props instanceof Error) {
        console.log("error while getting props of cccs job : " + props);
        return;
    }
    console.log("props : ", props);

    const settings2 = await service.getJobSettings(jobId);
    if(settings2 instanceof Error) {
        console.log("error while getting settings of cccs job");
        return;
    }
    console.log("get settings : ", settings2); */
}

main();
