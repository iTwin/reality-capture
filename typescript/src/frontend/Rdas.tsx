/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput, ProgressLinear, Select, SelectOption } from "@itwin/itwinui-react";
import React from "react";
import "./Rdas.css";

enum RdasJobTypes {
    O2D = "objects2D",
    S2D = "segmentation2D",
    L3D = "lines3D",
}

export function Rdas() {

    const [rdasJobType, setRdasJobType] = React.useState<string>("");
    const [inputs, setInputs] = React.useState<Map<string, string>>(new Map());
    const [outputTypes, setOutputTypes] = React.useState<string[]>([]);
    const [outputIds, setOutputIds] = React.useState<string[]>([]);

    const [step, setStep] = React.useState<string>("");
    const [percentage, setPercentage] = React.useState<string>("");

    const selectOptions: SelectOption<RdasJobTypes>[] = [
        { value: RdasJobTypes.O2D, label: RdasJobTypes.O2D },
        { value: RdasJobTypes.S2D, label: RdasJobTypes.S2D },
        { value: RdasJobTypes.L3D, label: RdasJobTypes.L3D },
    ];

    const onRdasJobTypeChange = (selectedValue: string): void => {
        setRdasJobType(selectedValue);
        setInputs(new Map());
        const newOutputs: string[] = [];
        newOutputs.push(selectedValue);
        if(selectedValue === "lines3D") {
            newOutputs.push("segmentation2D");
        }
        setOutputTypes(newOutputs);
    };

    const onJobRun = async (): Promise<void> => {
        setPercentage("0");
        setStep("Prepare step");
        const response = fetch("http://localhost:3001/requests/rdas", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: [...inputs],
                outputTypes,
                jobType: rdasJobType,
            })
        });
        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            const progress = await fetch("http://localhost:3001/requests/progress");
            const progressJson = await progress.json();
            setPercentage(progressJson.percentage);
            state = progressJson.step ?? progressJson.error;
            setStep(state);           
        }
        const resolved = await response;
        const responseJson = await resolved.json();
        setOutputIds(responseJson.outputIds);
    };

    const onJobCancel = async (): Promise<void> => {
        await fetch("http://localhost:3001/requests/cancelJobRDAS", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
        });
    };

    const getJobDiv = () => {
        switch(rdasJobType){
        case "objects2D":
            return (<>
                <LabeledInput className="rdas-control" displayStyle="inline" label="photos" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("photos", input.target.value)))}/>
                <LabeledInput className="rdas-control" displayStyle="inline" label="photoObjectDetector" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("photoObjectDetector", input.target.value)))}/>
            </>);
        case "segmentation2D":
            return (<>
                <LabeledInput className="rdas-control" displayStyle="inline" label="photos" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("photos", input.target.value)))}/>
                <LabeledInput className="rdas-control" displayStyle="inline" label="photoSegmentationDetector" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("photoSegmentationDetector", input.target.value)))}/>
            </>);
        case "lines3D":
            return (<>
                <LabeledInput className="rdas-control" displayStyle="inline" label="meshes" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("meshes", input.target.value)))}/>
                <LabeledInput className="rdas-control" displayStyle="inline" label="orientedPhotos" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("orientedPhotos", input.target.value)))}/>
                <LabeledInput className="rdas-control" displayStyle="inline" label="photoSegmentationDetector" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set("photoSegmentationDetector", input.target.value)))}/>
            </>);
        default:
            return <></>;
        }
    };

    const getOutputs = () => {
        switch(rdasJobType){
        case "objects2D":
            return (<>
                <LabeledInput className="rdas-control" displayStyle="inline" label="objects2D" disabled={true} value={outputIds[0] ?? ""}/>
            </>);
        case "segmentation2D":
            return (<>
                <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation2D" disabled={true} value={outputIds[0] ?? ""}/>
            </>);
        case "lines3D":
            return (<>
                <LabeledInput className="rdas-control" displayStyle="inline" label="lines3D" disabled={true} value={outputIds[0] ?? ""}/>
                <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation2D" disabled={true} value={outputIds[1] ?? ""}/>
            </>);
        default:
            return <></>;
        }
    };

    return(
        <div>
            <div className="rdas-controls-group">
                <Select className="rdas-control" placeholder="Job type" value={rdasJobType} options={selectOptions} onChange={onRdasJobTypeChange}/>
                {getJobDiv()}
                <Button className="rdas-control" disabled={rdasJobType === ""} onClick={onJobRun}>Run</Button>        
            </div>
            {step && (
                <div className="rdas-controls-group">
                    <ProgressLinear className="rdas-progress" value={parseInt(percentage)} labels={[step, percentage + "%"]}/>
                    <Button className="rdas-control" disabled={!step || step === "Done" || step === "Error"} onClick={onJobCancel}>Cancel</Button> 
                </div>
            )}
            <div className="rdas-controls-group">
                {getOutputs()}
            </div>           
        </div>
    );
}