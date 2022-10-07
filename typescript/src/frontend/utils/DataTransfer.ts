import { ContainerClient } from "@azure/storage-blob";
import { ITwinRealityData, RealityDataClientOptions, RealityDataAccessClient } from "@itwin/reality-data-client";
import { getRealityData } from "./ApiUtils";
import JSZip from "jszip";
import FileSaver from "file-saver";

async function patch(toPatch: File, localPathToRdId: Map<number, string>, isContextScene = true): Promise<string> {
    const text = await toPatch.text();
    const xmlDoc = new DOMParser().parseFromString(text, "text/xml");
    const references = xmlDoc.getElementsByTagName(isContextScene ? "Reference" : "Photo");
    for (let i = 0; i < references.length; i++) {
        const referencePath = references[i].getElementsByTagName(isContextScene ? "Path" : "ImagePath");
        if(referencePath.length === 0)
            continue; // No path in reference

        const pathValue = referencePath[0].textContent;
        if(!pathValue)
            continue; // No text content in reference path

        // The first character of Path/ImagePath should be the index of the uploaded image collection
        const uploadedDataIndex = parseInt(pathValue[0]);
        const realityDataId = localPathToRdId.get(uploadedDataIndex);
        if(!realityDataId)
            throw new Error("Can't patch the context scene/ ccorientations : reality data id missing. Please upload images before.");

        if(isContextScene) {
            referencePath[0].textContent = "rds:" + realityDataId;
        }
        else {
            const fileName = pathValue.split("/").pop();
            referencePath[0].textContent = realityDataId + "/" + fileName;
        }
    }
    const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
    return newXmlStr;
}

async function findCesiumRootDocument(files: FileList, fileName: string) : Promise<string> {
    let root = "";
    for(let i = 0; i < files.length; i++) {
        if(files[i].webkitRelativePath.includes(fileName)) {
            root = files[i].webkitRelativePath;
        }
    }
    return root;
}

async function findRootDocument(files: FileList, extension: string): Promise<string> {
    let root = "";
    for(let i = 0; i < files.length; i++) {
        if(files[i].webkitRelativePath.endsWith(extension)) {
            root = files[i].webkitRelativePath.split("/").slice(1).join("/");
        }
    }
    return root;
}

async function createRealityData(realityDataType: string, uploadedDataName: string, root = "", accessToken: string): Promise<ITwinRealityData> {
    const realityDataClientOptions: RealityDataClientOptions = {
        baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
    };
    const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    const realityData = new ITwinRealityData(rdaClient, null, process.env.IMJS_PROJECT_ID);
    realityData.displayName = uploadedDataName;
    realityData.description = uploadedDataName;
    realityData.classification = "Undefined";
    realityData.rootDocument = root;
    realityData.type = realityDataType;
    const iTwinRealityData = await rdaClient.createRealityData(accessToken, process.env.IMJS_PROJECT_ID, realityData);
    return iTwinRealityData;
}

export async function uploadFileList(files: FileList, realityDataType: string, uploadedDataName: string, 
    localPathToRdId: Map<number, string>, accessToken: string, cesiumFileName = ""): Promise<ITwinRealityData> {
    // TODO : improve data upload (see backend upload)
    let root = "";
    if(realityDataType === "Cesium3DTiles") {
        root = await findCesiumRootDocument(files, cesiumFileName);
    }
    if(realityDataType === "OPC") {
        root = await findRootDocument(files, ".opc");
    }
    else if(realityDataType === "3MX") {
        root = await findRootDocument(files, ".3mx");
    }

    const realityData = await createRealityData(realityDataType, uploadedDataName, root, accessToken);

    const blobUrl = await realityData.getBlobUrl(accessToken, "", true);
    const containerClient = new ContainerClient(blobUrl.toString());
    for(let i = 0; i < files.length; i++) {
        // remove selected folder from path
        const blobName = files[i].webkitRelativePath.split("/").slice(1).join("/");
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        if(blobName.endsWith(".xml")) {
            let text = "";
            if(blobName.includes("ContextScene.xml")) {
                text = await patch(files[i], localPathToRdId);
            }
            else if(blobName.includes("Orientations.xml")) {
                text = await patch(files[i], localPathToRdId, false);
            }
            else {
                text = await files[i].text();
            }


            const blob = new Blob([text] , { type: "text/xml"});
            const uploadBlobResponse = await blockBlobClient.uploadData(blob);
        }
        else {
            const buffer = await files[i].arrayBuffer();
            const uploadBlobResponse = await blockBlobClient.uploadData(buffer);
        }
    }
    return realityData;
}

export async function downloadRealityData(realityDataId: string, accessToken: string): Promise<void> {
    // Can't patch the downloaded files.
    const rd = await getRealityData(realityDataId, accessToken);
    const blobUrl = await rd.getBlobUrl(accessToken, "", true);
    const containerClient = new ContainerClient(blobUrl.toString());

    const zip = new JSZip();
    const iter = await containerClient.listBlobsFlat();
    for await (const blob of iter) 
    {
        const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
        const blobBody = await blobContent.blobBody;
        if(!blobBody)
            throw new Error("downloadRealityData : can't retrieve context scene blob body.");
            
        const text = await blobBody!.text();
        zip.file(blob.name, text.toString());
    }
    zip.generateAsync({ type: "blob" }).then(function (content) {
        FileSaver.saveAs(content, rd.displayName);
    });
}