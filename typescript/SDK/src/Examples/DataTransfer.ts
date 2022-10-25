import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { RealityDataType } from "../CommonData";

async function runRealityDataExample() {
    const ccImageCollection = "D:\\O2D-Motos\\images";
    const outputPath = "D:\\output";
    const ccImageCollectionName = "Test Moto Photos";

    const projectId = "ad14b27c-91ea-4492-9433-1e2d6903b5e4";
    const clientId = "service-pJ0wfNZEIWcpVD98kt4QuHqQy";
    const secret = "TcloM9JosQrTnSYhRVoQKdgv4ZR8qU/a37EWuVJKVT4ARSU4JmctyKI32n95tI3C7jm8tLJCDuop1+bR3BMZzg==";
    const serviceUrl = "https://qa-api.bentley.com/realitydata/";

    console.log("Reality Data Analysis sample job detecting 2D objects");
    const realityDataService = new RealityDataTransfer(serviceUrl, clientId, secret);
    console.log("Service initialized");

    // Upload CCImageCollection
    console.log("Uploading CCImagesCollection to cloud");
    const id = await realityDataService.uploadRealityData(ccImageCollection, ccImageCollectionName, 
        RealityDataType.CC_IMAGE_COLLECTION, projectId);
    if(id instanceof Error) {
        console.log("Error in upload:", id);
        return;
    }
    console.log("CCImagesCollection uploaded successfully");

    // Download CCImageCollection
    console.log("Downloading CCImagesCollection");
    const res = await realityDataService.downloadRealityData(id, outputPath);
    if(res) {
        console.log("Error in download:", id);
        return;
    }
    console.log("CCImagesCollection downloaded successfully");
}

runRealityDataExample();