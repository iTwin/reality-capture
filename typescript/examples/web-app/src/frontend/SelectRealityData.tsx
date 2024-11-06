/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput, ProgressRadial, Select, SelectOption } from "@itwin/itwinui-react";
import { RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";
import React from "react";
import "./SelectRealityData.css";
import { SvgRefresh } from "@itwin/itwinui-icons-react";

interface SelectRealityDataProps {
    /** Reality data access client to get the reality data list. */
    realityDataAccessClient: RealityDataAccessClient;
    /** Function to update the selected element in the parent component. */
    onSelectedDataChange: (select: string) => void;
    /** Type to filter the reality data */
    realityDataType?: string[];
    /** Selected reality data */
    selectedRealityData?: string;
    /** Placeholder content. */
    placeholder?: string;
    /** Number of suggested reality data */
    suggestionNumber?: 10 | 50 | 100 | 250 | 500;
}

async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export function SelectRealityData(props: SelectRealityDataProps) {
    const [realityDataList, setRealityDatas] = React.useState<ITwinRealityData[]>([]);
    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [name, setName] = React.useState<string>("");

    const initSelectRealityData = (): SelectOption<string>[] => {
        const entries: SelectOption<string>[] = [];
        realityDataList.forEach((realityData) => {
            entries.push({value: realityData.id , label: realityData.displayName ?? "", sublabel: realityData.id});
        });
        return entries;
    };

    const onRefreshRealityDataList = async (): Promise<void> => {
        let continuationToken = "";
        let response;
        let currentRealityDataList: ITwinRealityData[] = [];
        const suggestionNumber = props.suggestionNumber ?? 10;
        setLoading(true);
        do {
            response = await props.realityDataAccessClient.getRealityDatas("", import.meta.env.IMJS_PROJECT_ID, 
                {top: 500, continuationToken: continuationToken ?? undefined});
            continuationToken = response.continuationToken ?? "";

            response.realityDatas.forEach((realityData) => {
                if(props.realityDataType) {
                    if(realityData.type && props.realityDataType.includes(realityData.type) && realityData.displayName?.includes(name))
                        currentRealityDataList.push(realityData);
                }
                else if(realityData.displayName?.includes(name))
                    currentRealityDataList.push(realityData);
            });

            if(currentRealityDataList.length > suggestionNumber)
                currentRealityDataList = currentRealityDataList.slice(currentRealityDataList.length - suggestionNumber);
            
            sleep(50);
        }
        while(continuationToken);
        setLoading(false);

        currentRealityDataList.sort((realityData1, realityData2) => 
            realityData2.modifiedDateTime!.getTime() - realityData1.modifiedDateTime!.getTime());

        if(response)
            setRealityDatas([...currentRealityDataList]);
    };

    React.useEffect(() => {   
        onRefreshRealityDataList();
    }, []);

    const onSelectedDataChange = async (select: string): Promise<void> => {
        props.onSelectedDataChange(select);
    };

    return(
        <div className="select-controls-group">
            <Select className="select-control-right select-control-input" value={props.selectedRealityData} placeholder={props.placeholder ?? "Select reality data"}
                options={initSelectRealityData()} onChange={onSelectedDataChange}/>
            <LabeledInput displayStyle="inline" label="Filter by name" value={name} 
                onChange={(value) => {setName(value.target.value);}}/>
            <div className="select-control">
                { isLoading && (
                    <ProgressRadial indeterminate={true}/>
                )}
                { !isLoading && (
                    <Button startIcon={<SvgRefresh />} onClick={onRefreshRealityDataList} />
                )}
            </div>
        </div>
    );
}