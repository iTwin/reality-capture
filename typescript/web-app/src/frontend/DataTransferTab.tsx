/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput, Select, SelectOption } from "@itwin/itwinui-react";
import React, { ChangeEvent } from "react";
import "./DataTransferTab.css";
import { downloadRealityData, uploadFileList } from "./utils/DataTransfer";


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
    accessToken: string,
    onUploadedDataTypeChange: (type: string) => void;
    onUploadedDataIdChange: (id: string) => void;
    onDownloadedIdChange: (id: React.ChangeEvent<HTMLInputElement>) => void;
}

const localPathToRdId: Map<number, string> = new Map();

export function Rds(props: RdsProps) {

    const [uploadProgress, setUploadProgress] = React.useState<string>(""); // TODO : fix this regression
    const [uploadedDataName, setUploadedDataName] = React.useState<string>("");
    const [uploadedItemCount, setUploadedItemCount] = React.useState<number>(0);
    const uploadFilesRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (uploadFilesRef.current !== null) {
            uploadFilesRef.current.setAttribute("directory", "");
            uploadFilesRef.current.setAttribute("webkitdirectory", "");
        }
    }, [uploadFilesRef]);

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
        // TODO : upload progress
        if(!props.uploadedDataType)
            return;

        const input = document.getElementById("files") as HTMLInputElement;
        if(!input.files || !input.files.length)
            return;

        let cesiumRoot = "";
        if(props.uploadedDataType === "Cesium3DTiles") {
            const cesiumRootInput = document.getElementById("cesium-root") as HTMLInputElement;
            if(!cesiumRootInput.files || !cesiumRootInput.files.length)
                return;
            
            cesiumRoot = cesiumRootInput.files[0].name;
        }
        
        const realityData = await uploadFileList(input.files, props.uploadedDataType, uploadedDataName, localPathToRdId, 
            props.accessToken, cesiumRoot);
        props.onUploadedDataIdChange(realityData.id);
        if(props.uploadedDataType !== "ContextScene" && props.uploadedDataType !== "CCOrientations") {
            localPathToRdId.set(uploadedItemCount, realityData.id);
            setUploadedItemCount(uploadedItemCount + 1);
        }
    };

    const onTypeChange = async (select: string): Promise<void> => {
        props.onUploadedDataTypeChange(select);
        const cesiumRootInput = document.getElementById("cesium-root");
        const cesiumRootLabel = document.getElementById("cesium-root-label");
        if(!cesiumRootInput || !cesiumRootLabel)
            return;
        
        if(select === "Cesium3DTiles") {
            cesiumRootInput.hidden = false;
            cesiumRootLabel.hidden = false;
        }
        else {
            cesiumRootInput.hidden = true;
            cesiumRootLabel.hidden = true;
        }
    };

    const onUploadedDataNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setUploadedDataName(event.target.value);
    };

    const onDownloadFiles = async (): Promise<void> => {
        if(!props.downloadedDataId)
            return;
        
        await downloadRealityData(props.downloadedDataId, props.accessToken);
    };

    return(
        <div className="rds-controls-group">
            <input className="rds-control" type="file" id="files" ref={uploadFilesRef} />
            <Select className="rds-control" value={props.uploadedDataType} placeholder="Type of data to be uploaded" options={selectOptions} onChange={onTypeChange}/>
            <LabeledInput className="rds-control" displayStyle="inline" label="Name" value={uploadedDataName} onChange={onUploadedDataNameChange}/>
            <label className="rds-control" id="cesium-root-label" hidden={true}>Cesium root document</label>
            <input className="rds-control" type="file" id="cesium-root" hidden={true} />
            <Button className="rds-control" onClick={onUploadFiles}>Upload</Button>
            <p className="rds-control">{uploadProgress}</p>
            <LabeledInput className="rds-control" id="input-id" displayStyle="inline" label="Id" value={props.uploadedDataId} disabled={true}/>
            <hr className="rds-sep"/>
            <LabeledInput className="rds-control" displayStyle="inline" label="Data to download" placeholder="Id to download" onChange={props.onDownloadedIdChange}/>
            <Button className="rds-control" onClick={onDownloadFiles}>Download</Button>
        </div>
    );
}