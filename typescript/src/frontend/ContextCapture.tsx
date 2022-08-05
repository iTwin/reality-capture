import { Button, LabeledInput, ProgressLinear } from "@itwin/itwinui-react";
import React from "react";
import "./ContextCapture.css";


export function ContextCapture() {

    const [inputs, setInputs] = React.useState<Map<string, string>>(new Map());
    const [outputIds, setOutputIds] = React.useState<string[]>([]);

    const [step, setStep] = React.useState<string>("");
    const [percentage, setPercentage] = React.useState<string>("");

    const onJobRun = async (): Promise<void> => {
        setPercentage("0");
        setStep("Prepare step");
        const response = fetch("http://localhost:3001/requests/contextCapture", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "Full",
                inputs: [...inputs],
            })
        });
        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            const progress = await fetch("http://localhost:3001/requests/progressCCS");
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
        await fetch("http://localhost:3001/requests/cancelJobCSS", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
        });
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
                    <Button className="ccs-control" disabled={!step || step === "Done" || step === "Error"} onClick={onJobCancel}>Cancel</Button> 
                </div>
            )}
            <div className="ccs-controls-group">
                <LabeledInput className="ccs-control" displayStyle="inline" label="CCorientation" disabled={true} value={outputIds[0] ?? ""}/>                  
                <LabeledInput className="ccs-control" displayStyle="inline" label="Cesium 3D tiles" disabled={true} value={outputIds[1] ?? ""}/>
            </div>           
        </div>
    );
}