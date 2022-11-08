import { ClientInfo, RealityDataType } from "./CommonData";
import { ServiceTokenFactory } from "./TokenFactory";
import { RealityDataTransfer } from "./utils/RealityDataTransfer";
import * as dotenv from "dotenv";


async function main() {
    // const fileToUpload = "D:\\VerylargeFile\\orig";
    const fileToUpload = "D:\\L3D-Bridge\\GrandPont\\MinesotaAnnotations";

    dotenv.config();

    const projectId = process.env.IMJS_PROJECT_ID ?? "";
    const clientId = process.env.IMJS_CLIENT_ID ?? "";
    const secret = process.env.IMJS_SECRET ?? "";

    console.log("test");
    const clientInfo: ClientInfo = {clientId: clientId, scopes: new Set([...RealityDataTransfer.getScopes()]), 
        secret: secret, env: "qa-"};
    const tokenFactory = new ServiceTokenFactory(clientInfo);
    await tokenFactory.getToken();
    if(!tokenFactory.isOk())
        console.log("Can't get the access token");
    
    const realityDataService = new RealityDataTransfer(tokenFactory);
    console.log("Service initialized");

    // Upload Test file
    console.log("Uploading CCImagesCollection to cloud");
    const id = await realityDataService.downloadRealityData("4b32f502-e356-4a0b-af75-4660dd890c76", "D:\\output");
    console.log("CCImagesCollection uploaded successfully");
}

main();