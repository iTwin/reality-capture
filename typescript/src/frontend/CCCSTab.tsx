/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput, ProgressLinear } from "@itwin/itwinui-react";
import React from "react";
import { sleep } from "./utils/ApiUtils";
import "./CCCSTab.css";
import { cancelCCCSJob, getCCCSProgress, getReconstructionResult, runReconstructionJob } from "./utils/CCCS";

interface ContextCaptureProps {
    accessToken: string;
}

export function ContextCapture(props: ContextCaptureProps) {

    const [inputs, setInputs] = React.useState<Map<string, string>>(new Map());
    const [outputIds, setOutputIds] = React.useState<string[]>([]);

    const [step, setStep] = React.useState<string>("");
    const [percentage, setPercentage] = React.useState<string>("");

    const [jobToCancel, setJobToCancel] = React.useState<string>("");

    const onJobRun = async (): Promise<void> => {
        // TO TEST
        setPercentage("0");
        setStep("Prepare step");

        const jobId = await runReconstructionJob(inputs, props.accessToken, true);
        const outputs = getReconstructionResult(jobId, props.accessToken);
        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            await sleep(10000);
            const progress = await getCCCSProgress(jobId, props.accessToken);
            setPercentage(progress.progress);
            state = progress.state;
            setStep(progress.state);           
        }
        const resolvedOutputs = await outputs;
        setOutputIds(resolvedOutputs);
    };

    const onJobCancel = async (): Promise<void> => {
        cancelCCCSJob(jobToCancel, props.accessToken);
    };

    return(
        <div>
            <div className="ccs-controls-group">
                <LabeledInput className="ccs-control" displayStyle="inline" label="photos" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set(input.target.value, "CCImageCollection")))}/>
                <LabeledInput className="ccs-control" displayStyle="inline" label="orientation" placeholder="Enter id here..." 
                    onChange={(input: React.ChangeEvent<HTMLInputElement>) => setInputs(new Map(inputs.set(input.target.value, "CCOrientation")))}/>
                <Button className="ccs-control" disabled={inputs.size === 0} onClick={onJobRun}>Run</Button>        
            </div>
            {step && (
                <div className="ccs-controls-group">
                    <ProgressLinear className="ccs-progress" value={parseInt(percentage)} labels={[step, percentage + "%"]}/>
                </div>
            )}
            <div className="ccs-controls-group">
                <LabeledInput className="ccs-control" displayStyle="inline" label="job to cancel" placeholder="Enter id here..." 
                    onChange={(id: React.ChangeEvent<HTMLInputElement>): void => {setJobToCancel(id.target.value);}}/>
                <Button className="ccs-control" disabled={jobToCancel === ""} onClick={onJobCancel}>Cancel</Button> 
            </div>
            <div className="ccs-controls-group">
                <LabeledInput className="ccs-control" displayStyle="inline" label="CCorientation" disabled={true} value={outputIds[0] ?? ""}/>                  
                <LabeledInput className="ccs-control" displayStyle="inline" label="Cesium 3D tiles" disabled={true} value={outputIds[1] ?? ""}/>
            </div>           
        </div>
    );
}