import { RealityDataTransfer } from "../Utils/RealityDataTransfer";
import { ClientInfo, RealityDataType } from "../CommonData";
import * as dotenv from "dotenv";


async function runRealityDataExample() {
    const ccImageCollection = "D:\\O2D-Motos\\images";
    const outputPath = "D:\\output";
    const ccImageCollectionName = "Test Moto Photos";

    dotenv.config();

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";
    const redirectUrl = process.env.IMJS_AUTHORIZATION_REDIRECT_URI ?? "";

    console.log("Reality Data Analysis sample job detecting 2D objects");
    const clientInfo: ClientInfo = {clientId: clientId, secret: secret, redirectUrl: redirectUrl};
    const realityDataService = new RealityDataTransfer(clientInfo);
    console.log("Service initialized");

    // Upload CCImageCollection
    console.log("Uploading CCImagesCollection to cloud");
    const id = await realityDataService.uploadRealityData(ccImageCollection, ccImageCollectionName, 
        RealityDataType.CC_IMAGE_COLLECTION, projectId);
    console.log("CCImagesCollection uploaded successfully");

    // Download CCImageCollection
    console.log("Downloading CCImagesCollection");
    await realityDataService.downloadRealityData(id, outputPath);
    console.log("CCImagesCollection downloaded successfully");
}

runRealityDataExample();