/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput, Select, SelectOption } from "@itwin/itwinui-react";
import React from "react";
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
    uploadedDataSource: string;
    uploadedDataId: string;
    downloadedDataId: string;
    downloadTargetPath: string,
    onUploadedDataSourceChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUploadedDataTypeChange: (type: string) => void;
    onUploadedDataIdChange: (id: string) => void;
    onDownloadedIdChange: (id: React.ChangeEvent<HTMLInputElement>) => void;
    onDownloadTargetPathChange: (path: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Rds(props: RdsProps) {

    const [uploadProgress, setUploadProgress] = React.useState<string>("");

    const selectOptions: SelectOption<DataTypes>[] = [
        { value: DataTypes.CCImageCollection, label: "ContextCapture Image Collection" },
        { value: DataTypes.CCOrientations, label: "CCOrientations"},
        { value: DataTypes.Cesium3DTiles, label: "Cesium 3D Tiles" },
        { value: DataTypes.ContextDetector, label: "Context Detector" },
        { value: DataTypes.ContextScene, label: "Context Scene" },
        { value: DataTypes.Mesh3MX, label: "ContextCapture 3MX" },
        { value: DataTypes.OPC, label: "Web Ready Point Cloud" },
    ];

    const onUploadFiles = async (): Promise<void> => {
        if(!props.uploadedDataType || !props.uploadedDataSource)
            return;

        const response = fetch("http://localhost:3001/requests/upload/" + props.uploadedDataType + "/" + props.uploadedDataSource);
        
        let progress = "";
        while(progress !== "Failed" && progress !== "Done") {
            const result = await fetch("http://localhost:3001/requests/progressUpload");
            const progressJson = await result.json();
            progress = progressJson.progress;
            setUploadProgress(progress);
        }

        const resolved = await response;
        const responseJson = await resolved.json();
        props.onUploadedDataIdChange(responseJson.id);
    };

    const onSourceChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        props.onUploadedDataSourceChange(event);
    };

    const onTypeChange = async (select: string): Promise<void> => {
        props.onUploadedDataTypeChange(select);
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
                <LabeledInput className="rds-control" displayStyle="inline" label="Data to upload" placeholder="Enter path to folder here..." onChange={onSourceChange}/>
                <Select className="rds-control" value={props.uploadedDataType} placeholder="Type of data to be uploaded" options={selectOptions} onChange={onTypeChange}/>
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