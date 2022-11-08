/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput, ProgressLinear, Select, SelectOption } from "@itwin/itwinui-react";
import React from "react";
import { sleep, submitRequest } from "./utils/ApiUtils";
import "./RDASTab.css";
import { getRDASProgress, getRDASResult, runRDASJob } from "./utils/RDAS";

enum RdasJobTypes {
    O2D = "objects2D",
    S2D = "segmentation2D",
    L3D = "lines3D",
}

interface RdasProps {
    accessToken: string;
}

export function Rdas(props: RdasProps) {

    const [rdasJobType, setRdasJobType] = React.useState<string>("");
    const [inputs, setInputs] = React.useState<Map<string, string>>(new Map());
    const [outputTypes, setOutputTypes] = React.useState<string[]>([]);
    const [outputIds, setOutputIds] = React.useState<string[]>([]);

    const [step, setStep] = React.useState<string>("");
    const [percentage, setPercentage] = React.useState<string>("");

    const [jobToCancel, setJobToCancel] = React.useState<string>("");

    const selectOptions: SelectOption<RdasJobTypes>[] = [
        { value: RdasJobTypes.O2D, label: RdasJobTypes.O2D },
        { value: RdasJobTypes.S2D, label: RdasJobTypes.S2D },
        { value: RdasJobTypes.L3D, label: RdasJobTypes.L3D },
    ];

    const getRDASBase = () : string => { return "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydataanalysis/"; };

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

        const jobId = await runRDASJob(rdasJobType, inputs, outputTypes, props.accessToken); // TODO : compute number of photos
        const outputs = getRDASResult(jobId, props.accessToken);
        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            await sleep(10000);
            const progress = await getRDASProgress(jobId, props.accessToken);
            setPercentage(progress.progress);
            state = progress.state;
            setStep(progress.state);           
        }
        const resolvedOutputs = await outputs;
        setOutputIds(resolvedOutputs);
    };

    const onJobCancel = async (): Promise<void> => {
        await submitRequest("RDAS job : cancel ", props.accessToken, getRDASBase() + "jobs/" + jobToCancel, "PATCH", [200],
            {
                state: "cancelled",
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
                </div>
            )}
            <div className="ccs-controls-group">
                <LabeledInput className="ccs-control" displayStyle="inline" label="job to cancel" placeholder="Enter id here..." 
                    onChange={(id: React.ChangeEvent<HTMLInputElement>): void => {setJobToCancel(id.target.value);}}/>
                <Button className="ccs-control" disabled={jobToCancel === ""} onClick={onJobCancel}>Cancel</Button> 
            </div>
            <div className="rdas-controls-group">
                {getOutputs()}
            </div>           
        </div>
    );
}