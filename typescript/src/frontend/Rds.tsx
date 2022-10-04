/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContainerClient } from "@azure/storage-blob";
import { Button, LabeledInput, Select, SelectOption } from "@itwin/itwinui-react";
import { ITwinRealityData, RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";
import React, { ChangeEvent } from "react";
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

    const onUploadFiles = async (): Promise<void> => {
        // TODO : patch scene and orientations
        if(!props.uploadedDataType)
            return;

        console.log("1");
        const input = document.getElementById("files") as HTMLInputElement;
        let root = "";
        if(props.uploadedDataType === "Cesium3DTiles") {            
            root = await findRootDocument(input.files!, ".json");
        }
        else if(props.uploadedDataType === "OPC") {
            root = await findRootDocument(input.files!, ".opc");
        }

        console.log("2");
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
        const iTwinRealityData: ITwinRealityData = await rdaClient.createRealityData(props.accessToken, process.env.IMJS_PROJECT_ID, realityData);
        const realityDataId = iTwinRealityData.id;
        props.onUploadedDataIdChange(realityDataId);
        console.log("3 : created rd : ", realityDataId);

        const blobUrl = await iTwinRealityData.getBlobUrl(props.accessToken, "", true);
        const containerClient = new ContainerClient(blobUrl.toString());
        for(let i = 0; i < input.files!.length; i++) {
            // remove selected folder from path
            const blobName = input.files![i].webkitRelativePath.split("/").slice(1).join("/");
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            console.log("upload file : ", blobName);

            if(blobName.includes(".xml")) {
                let text = await input.files![i].text();
                
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
                const buffer = await input.files![i].arrayBuffer();
                const uploadBlobResponse = await blockBlobClient.uploadData(buffer);
            }
        }

        if(props.uploadedDataType !== "ContextScene" && props.uploadedDataType !== "CCOrientations") {
            localPathToRdId.set(uploadedItemCount, realityDataId);
            setUploadedItemCount(uploadedItemCount + 1);
            console.log("localPathToRdId : ",localPathToRdId);
        }
    };

    const onTypeChange = async (select: string): Promise<void> => {
        props.onUploadedDataTypeChange(select);
    };

    const onUploadedDataNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setUploadedDataName(event.target.value);
    };

    const onDownloadFiles = async (): Promise<void> => {
        if(!props.downloadTargetPath || !props.downloadedDataId)
            return;
                
        const response = await fetch("http://localhost:3001/requests/download", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: props.downloadedDataId,
                targetPath: props.downloadTargetPath,
            })
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