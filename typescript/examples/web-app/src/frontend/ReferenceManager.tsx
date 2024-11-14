/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, Table, ToggleSwitch } from "@itwin/itwinui-react";
import React, { useMemo, useState } from "react";
import "./DataTransferTab.css";
import "./ReferenceManager.css";
import { ReferenceTableBrowser } from "@itwin/reality-data-transfer";

export enum DataTypes {
    CCImageCollection = "CCImageCollection",
    CCOrientations = "CCOrientations",
    ContextScene = "ContextScene",
    ContextDetector = "ContextDetector",
    Cesium3DTiles = "Cesium3DTiles",
    Mesh3MX = "3MX",
    OPC = "OPC",
}

interface ReferenceManagerProps {
    referenceTable: ReferenceTableBrowser;
    onReferenceTableChanged: (type: ReferenceTableBrowser) => void;
    useReferenceTable: boolean;
    onUseReferenceTableChanged: (isUsed: boolean) => void;
}

export function ReferenceManager(props: ReferenceManagerProps) {
    const [isLoading, setIsLoading] = useState(false);

    const onReferenceLoad = async (): Promise<void> => {
        setIsLoading(true);
        const referenceTable = new ReferenceTableBrowser();
        await referenceTable.load();
        setIsLoading(false);
        props.onReferenceTableChanged(referenceTable);
    };

    const onReferenceSave = async (): Promise<void> => {
        await props.referenceTable.save();
    };

    const columns = useMemo(
        () => [
            {
                id: "path",
                Header: "Path",
                accessor: "path",
            },
            {
                id: "id",
                Header: "Id",
                accessor: "id",
            },
        ],
        [],
    );

    const displayReferences = (): JSX.Element => {
        const data: any[] = [];
        props.referenceTable.entries.forEach((value: string, key: string) => {
            data.push({path: key, id: value});
        });
        return <Table className="reference-control" columns={columns} 
            emptyTableContent={props.useReferenceTable === true ? "No reference." : "Disabled references."}
            data={props.useReferenceTable === true ? data : []} isLoading={isLoading} 
            style={{ width: 900, maxWidth: "50vw", height: 700, maxHeight: "40vh" }}/>;
    };

    return (
        <div>
            <div className="reference-group">
                <h2 className="reference-control">References</h2>
            </div>
            <div className="reference-group">
                <ToggleSwitch className="rdas-control" label={"Use reference table"} checked={props.useReferenceTable} labelPosition={"left"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {props.onUseReferenceTableChanged(e.target.checked);}} />   
            </div>
            <div className="reference-group">
                <Button disabled={!props.useReferenceTable} className="reference-control" onClick={() => { onReferenceLoad(); }}>Load</Button>
                <Button disabled={!props.useReferenceTable} className="reference-control" onClick={() => { onReferenceSave(); }}>Save</Button>          
            </div>
            <div className="reference-group">
                {displayReferences()}
            </div>
        </div>
    );
}