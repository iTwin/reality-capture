/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContainerClient } from "@azure/storage-blob";
import { Button, LabeledInput, Select, SelectOption } from "@itwin/itwinui-react";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import React, { ChangeEvent } from "react";
import JSZip from "jszip";
import FileSaver from "file-saver";
import "./Rds.css";


export enum DataTypes {
    CCImageCollection = "CCImageCollection",
    CCOrientations = "CCOrientations",
    ContextScene = "ContextScene",
    ContextDetector = "ContextDetector",
    Cesium3DTiles = "Cesium3DTiles",
    Mesh3MX = "3MX",
    OPC = "OPC",
}

interface RdsProps {
    uploadedDataType: string;
    uploadedDataId: string;
    downloadedDataId: string;
    downloadTargetPath: string,
    accessToken: string,
    onUploadedDataTypeChange: (type: string) => void;
    onUploadedDataIdChange: (id: string) => void;
    onDownloadedIdChange: (id: React.ChangeEvent<HTMLInputElement>) => void;
    onDownloadTargetPathChange: (path: React.ChangeEvent<HTMLInputElement>) => void;
}

const localPathToRdId: Map<number, string> = new Map();

export function Rds(props: RdsProps) {

    const [uploadProgress, setUploadProgress] = React.useState<string>(""); // TODO : fix this regression
    const [uploadedDataName, setUploadedDataName] = React.useState<string>("");
    const [uploadedItemCount, setUploadedItemCount] = React.useState<number>(0);
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (ref.current !== null) {
            ref.current.setAttribute("directory", "");
            ref.current.setAttribute("webkitdirectory", "");
        }
    }, [ref]);

    const selectOptions: SelectOption<DataTypes>[] = [
        { value: DataTypes.CCImageCollection, label: "ContextCapture Image Collection" },
        { value: DataTypes.CCOrientations, label: "CCOrientations"},
        { value: DataTypes.Cesium3DTiles, label: "Cesium 3D Tiles" },
        { value: DataTypes.ContextDetector, label: "Context Detector" },
        { value: DataTypes.ContextScene, label: "Context Scene" },
        { value: DataTypes.Mesh3MX, label: "ContextCapture 3MX" },
        { value: DataTypes.OPC, label: "Web Ready Point Cloud" },
    ];

    const patch = async (toPatch: string, isContextScene = true): Promise<string> => {
        const xmlDoc = new DOMParser().parseFromString(toPatch, "text/xml");
        const references = xmlDoc.getElementsByTagName(isContextScene ? "Reference" : "Photo");
        for (let i = 0; i < references.length; i++) {
            const referencePath = references[i].getElementsByTagName(isContextScene ? "Path" : "ImagePath");
            if(referencePath.length === 0)
                continue; // No path in reference
    
            const pathValue = referencePath[0].textContent;
            if(!pathValue)
                continue; // No text content in reference path
    
            const fileName = pathValue.split("/").pop();
            const uploadedDataIndex = parseInt(pathValue);
            const realityDataId = localPathToRdId.get(uploadedDataIndex);
            if(isContextScene)
                referencePath[0].textContent = "rds:" + realityDataId!;
            else
                referencePath[0].textContent = realityDataId! + "/" + fileName; // TO TEST
            
        }
        const newXmlStr = new XMLSerializer().serializeToString(xmlDoc);
        return newXmlStr;
    };

    const findRootDocument = async (files: FileList, extension: string): Promise<string> => {
        let root = "";
        for(let i = 0; i < files.length; i++) {
            if(files[i].webkitRelativePath.includes(extension)) {
                root = files[i].webkitRelativePath.split("/").slice(1).join("/");
            }
        }
        return root;
    };

    const createRealityData = async (root?: string): Promise<ITwinRealityData> => {
        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        const realityData = new ITwinRealityData(rdaClient, null, process.env.IMJS_PROJECT_ID);
        realityData.displayName = uploadedDataName;
        realityData.description = uploadedDataName;
        realityData.classification = "Undefined";
        realityData.rootDocument = root;
        realityData.type = props.uploadedDataType;
        const iTwinRealityData = await rdaClient.createRealityData(props.accessToken, process.env.IMJS_PROJECT_ID, realityData);
        return iTwinRealityData;
    }

    const onUploadFiles = async (): Promise<void> => {
        // TODO : improve scene upload (see backend upload)
        // TODO : upload progress
        if(!props.uploadedDataType)
            return;

        const input = document.getElementById("files") as HTMLInputElement;
        if(!input.files || !input.files.length)
            return;
        
        let root = "";
        if(props.uploadedDataType === "Cesium3DTiles") {            
            root = await findRootDocument(input.files!, ".json");
        }
        else if(props.uploadedDataType === "OPC") {
            root = await findRootDocument(input.files!, ".opc");
        }

        const realityData = await createRealityData(root);
        props.onUploadedDataIdChange(realityData.id);

        const blobUrl = await realityData.getBlobUrl(props.accessToken, "", true);
        const containerClient = new ContainerClient(blobUrl.toString());
        for(let i = 0; i < input.files.length; i++) {
            // remove selected folder from path
            const blobName = input.files[i].webkitRelativePath.split("/").slice(1).join("/");
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            if(blobName.includes(".xml")) {
                let text = await input.files[i].text();
                
                if(blobName.includes("ContextScene.xml")) {
                    text = await patch(text);
                }
                else if(blobName.includes("Orientations.xml")) {
                    text = await patch(text, false);
                }         

                const blob = new Blob([text] , { type: "text/xml"});
                const uploadBlobResponse = await blockBlobClient.uploadData(blob);
            }
            else {
                const buffer = await input.files[i].arrayBuffer();
                const uploadBlobResponse = await blockBlobClient.uploadData(buffer);
            }
        }

        if(props.uploadedDataType !== "ContextScene" && props.uploadedDataType !== "CCOrientations") {
            localPathToRdId.set(uploadedItemCount, realityData.id);
            setUploadedItemCount(uploadedItemCount + 1);
        }
    };

    const onTypeChange = async (select: string): Promise<void> => {
        props.onUploadedDataTypeChange(select);
    };

    const onUploadedDataNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setUploadedDataName(event.target.value);
    };

    const onDownloadFiles = async (): Promise<void> => {
        //TODO : patch scene and orientations
        if(!props.downloadedDataId)
            return;

        const realityDataClientOptions: RealityDataClientOptions = {
            baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
        };
        const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
        const rd = await rdaClient.getRealityData(props.accessToken, process.env.IMJS_PROJECT_ID, props.downloadedDataId);
        const blobUrl = await rd.getBlobUrl(props.accessToken, "", true);
        const containerClient = new ContainerClient(blobUrl.toString());

        const zip = new JSZip();
        const iter = await containerClient.listBlobsFlat();
        for await (const blob of iter) 
        {
            const blobContent = await containerClient.getBlockBlobClient(blob.name).download(0);
            const blobBody = await blobContent.blobBody;
            const text = await blobBody!.text();
            zip.file(blob.name, text.toString());
        }
        zip.generateAsync({ type: "blob" }).then(function (content) {
            FileSaver.saveAs(content, rd.displayName);
        });
    };

    return(
        <div>
            <div className="rds-controls-group">
                <input className="rds-control" type="file" id="files" ref={ref} />
                <Select className="rds-control" value={props.uploadedDataType} placeholder="Type of data to be uploaded" options={selectOptions} onChange={onTypeChange}/>
                <LabeledInput className="rds-control" id="name-id" displayStyle="inline" label="Name" value={uploadedDataName} onChange={onUploadedDataNameChange}/>
                <Button className="rds-control" onClick={onUploadFiles}>Upload</Button>
                <p className="rds-control">{uploadProgress}</p>
            </div>
            <div className="rds-controls-group">
                <LabeledInput className="rds-control" id="input-id" displayStyle="inline" label="Id" value={props.uploadedDataId} disabled={true}/>
            </div>
            <hr className="rds-sep"/>
            <div className="rds-controls-group">
                <LabeledInput className="rds-control" displayStyle="inline" label="Data to download" placeholder="Id to download" onChange={props.onDownloadedIdChange}/>
                <LabeledInput className="rds-control" displayStyle="inline" label="To" placeholder="Target local path" onChange={props.onDownloadTargetPathChange}/>
                <Button className="rds-control" onClick={onDownloadFiles}>Download</Button>
            </div>
        </div>
    );
}