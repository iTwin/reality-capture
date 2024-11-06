/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SvgDownload, SvgUploadToCloud } from "@itwin/itwinui-icons-react";
import { Button, Input, InputGroup, Label, LabeledInput, ProgressLinear, Select, SelectOption } from "@itwin/itwinui-react";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import React, { ChangeEvent, MutableRefObject, useCallback, useEffect } from "react";
import "./DataTransferTab.css";
import { ReferenceManager } from "./ReferenceManager";
import { SelectRealityData } from "./SelectRealityData";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { RealityDataType } from "@itwin/reality-capture-common";
import { RealityDataTransferBrowser, ReferenceTableBrowser } from "@itwin/reality-data-transfer";


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
    realityDataAccessClient: RealityDataAccessClient;
    authorizationClient: BrowserAuthorizationClient;
    referenceTable: ReferenceTableBrowser;
    onReferenceTableChanged: (type: ReferenceTableBrowser) => void;
    useReferenceTable: boolean;
    onUseReferenceTableChanged: (isUsed: boolean) => void;
}

export function Rds(props: RdsProps) {
    const [downloadProgress, setDownloadProgress] = React.useState<number>(-1);
    const [downloadId, setDownloadId] = React.useState<string>("");

    const [uploadedDataType, setUploadedDataType] = React.useState<string>("");
    const [uploadedDataId, setUploadedDataId] = React.useState<string>("");
    const [uploadedDataName, setUploadedDataName] = React.useState<string>("");
    const [rootDocumentName, setRootDocumentName] = React.useState<string>("");
    const [uploadProgress, setUploadProgress] = React.useState<number>(-1);
    const [filesToUpload, setFilesToUpload] = React.useState<File[]>([]);

    const [contextScenePaths, setContextScenePaths] = React.useState<string[]>([]);
    const [contextSceneIds, setContextSceneIds] = React.useState<string[]>([]);

    const uploadFilesRef = React.useRef<HTMLInputElement>(null);
    const realityDataTransfer = React.useRef() as MutableRefObject<RealityDataTransferBrowser>;

    const initRds = useCallback(async () => {
        let prefix = import.meta.env.IMJS_URL_PREFIX ?? "";
        if(prefix === "dev-")
            prefix = "qa-";
        
        realityDataTransfer.current = new RealityDataTransferBrowser(props.authorizationClient.getAccessToken.bind(props.authorizationClient), prefix);
        realityDataTransfer.current.setUploadHook(uploadProgressHook);
        realityDataTransfer.current.setDownloadHook(downloadProgressHook);
    }, []);

    useEffect(() => {
        document.getElementById("upload")!.addEventListener("change", () => {
            const input = document.getElementById("upload") as HTMLInputElement;
            if (!input.files || !input.files.length) {
                setFilesToUpload([]);
                return;
            }

            setFilesToUpload([...input.files]);
        });
    }, []);

    useEffect(() => {
        void initRds();
    }, [initRds]);

    React.useEffect(() => {
        if (uploadFilesRef.current !== null) {
            uploadFilesRef.current.setAttribute("directory", "");
            uploadFilesRef.current.setAttribute("webkitdirectory", "");
        }
    }, [uploadFilesRef]);

    const uploadProgressHook = (progress: number): boolean => {
        setUploadProgress(progress);
        return true;
    };

    const downloadProgressHook = (progress: number): boolean => {
        setDownloadProgress(progress);
        return true;
    };

    const selectOptions: SelectOption<DataTypes>[] = [
        { value: DataTypes.CCImageCollection, label: "ContextCapture Image Collection" },
        { value: DataTypes.CCOrientations, label: "CCOrientations" },
        { value: DataTypes.Cesium3DTiles, label: "Cesium 3D Tiles" },
        { value: DataTypes.ContextDetector, label: "Context Detector" },
        { value: DataTypes.ContextScene, label: "Context Scene" },
        { value: DataTypes.Mesh3MX, label: "ContextCapture 3MX" },
        { value: DataTypes.OPC, label: "Web Ready Point Cloud" },
    ];

    const listPathsToResolve = async (file: File, type: RealityDataType.CONTEXT_SCENE | RealityDataType.CC_ORIENTATIONS): Promise<boolean> => {
        const paths: string[] = [];
        if (type === RealityDataType.CONTEXT_SCENE) {
            const xmlDoc = new DOMParser().parseFromString(await file.text(), "text/xml");
            const references = xmlDoc.getElementsByTagName("Reference");
            for (let i = 0; i < references.length; i++) {
                const id = references[i].getAttribute("id");
                if (!id)
                    continue; // Attribute id doesn't exist

                const path = references[i].getElementsByTagName("Path");
                if (path.length === 0)
                    continue; // No path in reference

                const pathValue = path[0].textContent;
                if (!pathValue)
                    continue; // No text content in reference path

                if (!props.referenceTable.getCloudIdFromLocalPath(pathValue))
                    paths.push(pathValue);
            }
        }
        else {
            const xmlDoc = new DOMParser().parseFromString(await file.text(), "text/xml");
            const photos = xmlDoc.getElementsByTagName("Photo");
            for (let i = 0; i < photos.length; i++) {
                const imagePath = photos[i].getElementsByTagName("ImagePath");
                const maskPath = photos[i].getElementsByTagName("MaskPath");
                if (!imagePath.length)
                    continue;

                let pathValue = imagePath[0].textContent;
                if (!pathValue)
                    continue;

                pathValue = pathValue.replace(/\\/g, "/");
                const dirName = pathValue.substring(0, pathValue.lastIndexOf("/"));
                if (!props.referenceTable.getCloudIdFromLocalPath(dirName) && !paths.includes(dirName))
                    paths.push(dirName);

                if (maskPath.length) {
                    let maskPathValue = maskPath[0].textContent;
                    if (!maskPathValue)
                        continue;

                    maskPathValue = maskPathValue.replace(/\\/g, "/");
                    const maskDirName = pathValue.substring(0, pathValue.lastIndexOf("/"));
                    if (!props.referenceTable.getCloudIdFromLocalPath(maskDirName) && !paths.includes(maskDirName))
                        paths.push(maskDirName);
                }
            }
        }

        setContextScenePaths(paths);
        setContextSceneIds(new Array<string>(paths.length));
        return paths.length > 0;
    };

    const listPathsToResolveJson = async (file: File, type: RealityDataType.CONTEXT_SCENE | RealityDataType.CC_ORIENTATIONS): Promise<boolean> => {
        const paths: string[] = [];
        if (type === RealityDataType.CONTEXT_SCENE) {
            const text = await file.text();
            const json = JSON.parse(text);

            for (const referenceId in json.References) {
                let referencePath = json.References[referenceId].Path;
                referencePath = referencePath.replace(/\\/g, "/");

                if (!props.referenceTable.getCloudIdFromLocalPath(referencePath))
                    paths.push(referencePath);
            }
        }
        else {
            const text = await file.text();
            const json = JSON.parse(text);

            for (const photo in json.Photos) {
                let imagePath = json.References[photo].ImagePath;
                let maskPath = json.References[photo].MaskPath;
                imagePath = imagePath.replace(/\\/g, "/");
                maskPath = maskPath.replace(/\\/g, "/");


                const dirName = imagePath.substring(0, imagePath.lastIndexOf("/"));
                if (!props.referenceTable.getCloudIdFromLocalPath(dirName) && !paths.includes(dirName))
                    paths.push(dirName);

                if (maskPath.length) {
                    const maskDirName = maskPath.substring(0, maskPath.lastIndexOf("/"));
                    if (!props.referenceTable.getCloudIdFromLocalPath(maskDirName) && !paths.includes(maskDirName))
                        paths.push(maskDirName);
                }
            }
        }

        setContextScenePaths(paths);
        setContextSceneIds(new Array<string>(paths.length));
        return paths.length > 0;
    };

    const onUploadFiles = async (): Promise<void> => {
        setUploadedDataId("");
        if (props.useReferenceTable && (uploadedDataType === RealityDataType.CONTEXT_SCENE || uploadedDataType === RealityDataType.CC_ORIENTATIONS)) {
            if (await listPathsToResolve(filesToUpload[0], uploadedDataType))
                return; // The user must resolve the paths errors before uploading the scene/orientations
        }

        const realityDataId = await realityDataTransfer.current.uploadRealityDataBrowser(filesToUpload, uploadedDataType, uploadedDataName,
            import.meta.env.IMJS_PROJECT_ID!, rootDocumentName.length > 0 ? rootDocumentName : undefined, 
            props.useReferenceTable === true ? props.referenceTable : undefined);
        
        if(realityDataId)
            setUploadProgress(100);
        
        if (props.useReferenceTable && uploadedDataType !== RealityDataType.CONTEXT_SCENE && uploadedDataType !== RealityDataType.CC_ORIENTATIONS)
            props.referenceTable.addReference(filesToUpload[0].webkitRelativePath.split("/")[0]!, realityDataId);

        setUploadedDataId(realityDataId);
        setContextSceneIds([]);
        setContextScenePaths([]);
    };

    const onCancelUpload = async (): Promise<void> => {
        setContextSceneIds([]);
        setContextScenePaths([]);
    };

    const onDownloadFiles = async (): Promise<void> => {
        await realityDataTransfer.current.downloadRealityDataBrowser(downloadId, import.meta.env.IMJS_PROJECT_ID ?? "", props.useReferenceTable === 
            true ? props.referenceTable : undefined);
        setDownloadProgress(100);
    };

    const onTypeChange = async (select: string): Promise<void> => {
        setUploadedDataType(select);
    };

    const onCloudIdSelected = async (cloudId: string, path: string, index: number): Promise<void> => {
        const newReferenceTable = props.referenceTable;
        if(newReferenceTable.hasCloudId(cloudId)) {
            // This entry has been uploaded but, we just know the folder name. Delete this old entry since the path is not absolute.
            const localPath = newReferenceTable.getLocalPathFromCloudId(cloudId);
            newReferenceTable.removeReference(localPath, cloudId);
            newReferenceTable.addReference(path, cloudId);
        }
        else // TODO
            newReferenceTable.addReference(path, cloudId);
        
        props.onReferenceTableChanged(props.referenceTable);

        const newContextSceneIds = [...contextSceneIds];
        newContextSceneIds[index] = cloudId;
        setContextSceneIds(newContextSceneIds);
    };

    const onDownloadIdChange = async (select: string): Promise<void> => {
        setDownloadId(select);
    };

    const onUploadedDataNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setUploadedDataName(event.target.value);
    };

    const onRootDocumentNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setRootDocumentName(event.target.value);
    };

    return (
        <div className="rds-wrapper">
            <div>
                <div className="rds-controls-group">
                    <h2 className="rds-control">Upload data</h2>
                </div>
                <div className="rds-controls-group">
                    <h4 className="rds-control rds-label">Local data</h4>
                    <Button className="rds-control rds-input" onClick={() => {document.getElementById("upload")!.click();}}>
                        Select folder to upload
                    </Button>
                    <p className="rds-control rds-label">{filesToUpload.length > 0 ? filesToUpload.length + " files to upload" : ""}</p>
                    <input className="invisible" type="file" id="upload" ref={uploadFilesRef} disabled={contextScenePaths.length > 0} />
                </div>
                <div className="rds-controls-group">
                    <h4 className="rds-control rds-label">Type</h4>
                    <Select className="rds-control rds-input" value={uploadedDataType} placeholder="Select type"
                        options={selectOptions} onChange={onTypeChange} disabled={contextScenePaths.length > 0} />
                </div>
                <div className="rds-controls-group">
                    <h4 className="rds-control rds-label">Name</h4>
                    <Input placeholder="Choose name" className="rds-control rds-input" value={uploadedDataName}
                        onChange={onUploadedDataNameChange} disabled={contextScenePaths.length > 0} />
                </div>
                {(uploadedDataType === DataTypes.Cesium3DTiles || uploadedDataType === DataTypes.Mesh3MX || uploadedDataType === DataTypes.OPC) && (
                    <div className="rds-controls-group">
                        <LabeledInput className="rds-control" displayStyle="inline" label="Root document" value={rootDocumentName}
                            onChange={onRootDocumentNameChange} disabled={contextScenePaths.length > 0} />
                    </div>
                )}
                {contextScenePaths.length > 0 && (
                    <div>
                        <div className="rds-controls-group">
                            <InputGroup className="rds-control" label="Associate local paths to reality data and reclick on Upload">
                                <table className="rds-table">
                                    <tbody>
                                        {contextScenePaths.map((path, i) =>
                                            <tr key={i}>
                                                <th>
                                                    <Label>
                                                        {path}
                                                    </Label>
                                                </th>
                                                <td>
                                                    <SelectRealityData realityDataAccessClient={props.realityDataAccessClient}
                                                        onSelectedDataChange={(cloudId: string) => onCloudIdSelected(cloudId, path, i)}
                                                        selectedRealityData={contextSceneIds[i]} />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </InputGroup>                        
                        </div>
                        <div className="rds-controls-group">
                            <Button className="rds-control" hidden={contextScenePaths.length === 0} 
                                onClick={onCancelUpload}>Cancel</Button>
                        </div>
                    </div>
                )}
                <div className="rds-controls-group">
                    <Button disabled={filesToUpload.length === 0 || uploadedDataType === "" || uploadedDataName === ""} 
                        className="rds-control" onClick={onUploadFiles} startIcon={<SvgUploadToCloud/>} />
                </div>
                {uploadProgress >= 0 && (
                    <ProgressLinear className="rds-control" value={uploadProgress} 
                        labels={uploadProgress === 100 ? ["Done"] : []}/>
                )}
                {uploadedDataId && (
                    <div className="rds-controls-group">
                        <h4 className="rds-control rds-label">Created data id</h4>
                        <Input className="rds-control rds-input" id="input-id" value={uploadedDataId} disabled={true} />
                    </div>
                )}
                <hr className="rds-sep" />
                <div className="rds-controls-group">
                    <h2 className="rds-control">Download data</h2>
                </div>
                <div className="rds-controls-group">
                    <div className="rds-control">
                        <SelectRealityData realityDataAccessClient={props.realityDataAccessClient}
                            onSelectedDataChange={onDownloadIdChange} selectedRealityData={downloadId} />
                    </div>
                </div>
                <div className="rds-controls-group">
                    <Button className="rds-control" disabled={downloadId === ""} onClick={onDownloadFiles} startIcon={<SvgDownload/>}/>
                </div>
                {downloadProgress >= 0 && (
                    <ProgressLinear className="rds-control" value={downloadProgress} 
                        labels={downloadProgress === 100 ? ["Done"] : []}/>
                )}
            </div>
            <div>
                <ReferenceManager referenceTable={props.referenceTable} onReferenceTableChanged={props.onReferenceTableChanged} 
                    useReferenceTable={props.useReferenceTable} onUseReferenceTableChanged={props.onUseReferenceTableChanged}/>
            </div>
        </div>
    );
}