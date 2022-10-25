import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { RealityDataType } from "../CommonData";
import * as dotenv from "dotenv";


async function runRealityDataExample() {
    const ccImageCollection = "D:\\O2D-Motos\\images";
    const outputPath = "D:\\output";
    const ccImageCollectionName = "Test Moto Photos";

    dotenv.config();

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const serviceUrl = process.env.IMJS_RDA_URL ?? "";

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