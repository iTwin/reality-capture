/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, Input, LabeledInput, ProgressLinear, Select, SelectOption, ThemeProvider, ToggleSwitch } from "@itwin/itwinui-react";
import React, { ChangeEvent, MutableRefObject, useCallback, useEffect } from "react";
import "./RDASTab.css";
import { SelectRealityData } from "./SelectRealityData";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import { SvgPlay, SvgStop } from "@itwin/itwinui-icons-react";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { JobSettings, O2DJobSettings, RealityDataAnalysisService, S2DJobSettings, S3DJobSettings, SOrthoJobSettings } from "@itwin/reality-capture-analysis";
import { JobState } from "@itwin/reality-capture-common";

enum RdasJobTypes {
    O2D = "objects2D",
    S2D = "segmentation2D",
    SOrtho = "segmentationOrthophoto",
    S3D = "segmentation3D",
}

interface RdasProps {
    realityDataAccessClient: RealityDataAccessClient;
    authorizationClient: BrowserAuthorizationClient;
}

async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export function Rdas(props: RdasProps) {
    const [rdasJobType, setRdasJobType] = React.useState<string>("");
    const [rdasJobName, setRdasJobName] = React.useState<string>("");
    const [jobSettings, setJobSettings] = React.useState<JobSettings>(new O2DJobSettings());
    const [step, setStep] = React.useState<string>("");
    const [percentage, setPercentage] = React.useState<number>(0);
    const [jobId, setJobId] = React.useState<string>("");

    const realityDataAnalysisService = React.useRef() as MutableRefObject<RealityDataAnalysisService>;

    const selectOptions: SelectOption<string>[] = [
        { value: RdasJobTypes.O2D, label: RdasJobTypes.O2D },
        { value: RdasJobTypes.S2D, label: RdasJobTypes.S2D },
        { value: RdasJobTypes.SOrtho, label: RdasJobTypes.SOrtho },
        { value: RdasJobTypes.S3D, label: RdasJobTypes.S3D },
    ];

    const initRdas = useCallback(async () => {
        const prefix = import.meta.env.IMJS_URL_PREFIX ?? "";
        realityDataAnalysisService.current = new RealityDataAnalysisService(props.authorizationClient.getAccessToken.bind(props.authorizationClient), prefix);
    }, []);
    
    useEffect(() => {
        void initRdas();
    }, [initRdas]);

    const onRdasJobTypeChange = (selectedValue: string): void => {
        setRdasJobType(selectedValue);
        // Set a default output for each job type.
        if(selectedValue === RdasJobTypes.O2D) {
            const settings = new O2DJobSettings();
            settings.outputs.objects2D = "objects2D";
            setJobSettings(settings);
        }
        else if(selectedValue === RdasJobTypes.S2D) {
            const settings = new S2DJobSettings();
            settings.outputs.segmentation2D = "segmentation2D";
            settings.outputs.segmentedPhotos = "segmentedPhotos";
            setJobSettings(settings);
        }
        else if(selectedValue === RdasJobTypes.SOrtho) {
            const settings = new SOrthoJobSettings();
            settings.outputs.segmentation2D = "segmentation2D";
            settings.outputs.segmentedPhotos = "segmentedPhotos";
            setJobSettings(settings);
        }
        else if(selectedValue === RdasJobTypes.S3D) {
            const settings = new S3DJobSettings();
            settings.outputs.segmentation3D = "segmentation3D";
            setJobSettings(settings);
        }
    };

    const onRdasJobNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setRdasJobName(event.target.value);
    };
 
    const onJobRun = async (): Promise<void> => {
        setPercentage(0);
        setStep("Prepare step");
        const id = await realityDataAnalysisService.current.createJob(jobSettings, rdasJobName, import.meta.env.IMJS_PROJECT_ID!);
        await realityDataAnalysisService.current.submitJob(id);
        setJobId(id);
        let currentStep = JobState.ACTIVE;

        while(currentStep === JobState.ACTIVE) {
            const progress = await realityDataAnalysisService.current.getJobProgress(id);
            const job = await realityDataAnalysisService.current.getJobProperties(id);
            setPercentage(progress.progress);
            
            if(progress.state === JobState.SUCCESS) {
                currentStep = JobState.SUCCESS;
                setStep(currentStep);
            }
            else if(job.state === JobState.CANCELLED || progress.state === JobState.CANCELLED) {
                currentStep = JobState.CANCELLED;
                setStep(currentStep);
            }
            else if(progress.state === JobState.FAILED) {
                currentStep = JobState.FAILED;
                setStep(currentStep);
            }
            else if(progress.state === JobState.ACTIVE) {
                console.log("Progress: " + progress.progress + ", step: " + progress.step);
                setStep(progress.step);
            }
            await sleep(6000);
        }
        if(currentStep === JobState.SUCCESS) {
            const properties = await realityDataAnalysisService.current.getJobProperties(id);
            setJobSettings(properties.settings);
        }
        setJobId("");
    };

    const onJobCancel = async (): Promise<void> => {
        await realityDataAnalysisService.current.cancelJob(jobId);
    };

    const setO2DInput = (input: "photos" | "photoObjectDetector", value: string): void => {
        const target = new O2DJobSettings();
        const settings = Object.assign(target, jobSettings as O2DJobSettings);
        settings.inputs[input] = value;
        setJobSettings(settings);
    };

    const setS2DInput = (input: "photos" | "photoSegmentationDetector", value: string): void => {
        const target = new S2DJobSettings();
        const settings = Object.assign(target, jobSettings as S2DJobSettings);
        settings.inputs[input] = value;
        setJobSettings(settings);
    };

    const setOrthoInput = (input: "orthophoto" | "orthophotoSegmentationDetector", value: string): void => {
        const target = new SOrthoJobSettings();
        const settings = Object.assign(target, jobSettings as SOrthoJobSettings);
        settings.inputs[input] = value;
        setJobSettings(settings);
    };

    const setS3DInput = (input: "pointClouds" | "meshes" | "segmentation3D" | "pointCloudSegmentationDetector", value: string): void => {
        const target = new S3DJobSettings();
        const settings = Object.assign(target, jobSettings as S3DJobSettings);
        settings.inputs[input] = value;
        setJobSettings(settings);
    };

    const setO2DParameter = (parameter: "maxDist" | "minPhotos" | "useTiePoints", value: number | boolean): void => {
        const target = new O2DJobSettings();
        const settings = Object.assign(target, jobSettings as O2DJobSettings);
        if(parameter === "useTiePoints")
            settings.options[parameter] = value as boolean;
        else
            settings.options[parameter] = value as number;
        setJobSettings(settings);
    };

    const setS2DParameter = (parameter: "computeLineWidth" | "removeSmallComponents" | "minPhotos", value: number | boolean): void => {
        const target = new S2DJobSettings();
        const settings = Object.assign(target, jobSettings as S2DJobSettings);
        if(parameter === "computeLineWidth")
            settings.options[parameter] = value as boolean;
        else
            settings.options[parameter] = value as number;
        setJobSettings(settings);
    };

    const setS3DParameter = (parameter: "computeLineWidth" | "removeSmallComponents" | "saveConfidence", value: number | boolean): void => {
        const target = new S3DJobSettings();
        const settings = Object.assign(target, jobSettings as S3DJobSettings);
        if(parameter === "removeSmallComponents")
            settings.options[parameter] = value as number;
        else
            settings.options[parameter] = value as boolean;
        setJobSettings(settings);
    };

    const getInputControls = () => {
        switch(rdasJobType) {
        case RdasJobTypes.O2D:
            return (
                <div>
                    <div className="rdas-control">
                        <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select photos (context scene)"} 
                            onSelectedDataChange={(select: string) => setO2DInput("photos", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as O2DJobSettings).inputs["photos"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={1} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select photo object detector"} 
                            onSelectedDataChange={(select: string) => setO2DInput("photoObjectDetector", select)}
                            realityDataType={["ContextDetector"]} selectedRealityData={(jobSettings as O2DJobSettings).inputs["photoObjectDetector"]} />
                    </div>
                </div>
            );
        case RdasJobTypes.S2D:
            return (
                <div>
                    <div className="rdas-control">
                        <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select photos (context scene)"} 
                            onSelectedDataChange={(select: string) => setS2DInput("photos", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as S2DJobSettings).inputs["photos"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={1} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select photo segmentation detector"} 
                            onSelectedDataChange={(select: string) => setS2DInput("photoSegmentationDetector", select)}
                            realityDataType={["ContextDetector"]} selectedRealityData={(jobSettings as S2DJobSettings).inputs["photoSegmentationDetector"]} />
                    </div>
                </div>
            );
        case RdasJobTypes.SOrtho:
            return (
                <div>
                    <div className="rdas-control">
                        <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select orthophoto (context scene)"}
                            onSelectedDataChange={(select: string) => setOrthoInput("orthophoto", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as SOrthoJobSettings).inputs["orthophoto"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={1} realityDataAccessClient={props.realityDataAccessClient} 
                            placeholder={"Select orthophoto segmentation detector"}
                            onSelectedDataChange={(select: string) => setOrthoInput("orthophotoSegmentationDetector", select)}
                            realityDataType={["ContextDetector"]} 
                            selectedRealityData={(jobSettings as SOrthoJobSettings).inputs["orthophotoSegmentationDetector"]} />
                    </div>
                </div>
            );
        case RdasJobTypes.S3D:
            return (
                <div>
                    <div className="rdas-control">
                        <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select orthophoto (context scene)"}
                            onSelectedDataChange={(select: string) => setS3DInput("pointClouds", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as S3DJobSettings).inputs["pointClouds"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={1} realityDataAccessClient={props.realityDataAccessClient}
                            placeholder={"Select point cloud segmentation detector"}
                            onSelectedDataChange={(select: string) => setS3DInput("pointCloudSegmentationDetector", select)}
                            realityDataType={["ContextDetector"]}
                            selectedRealityData={(jobSettings as S3DJobSettings).inputs["pointCloudSegmentationDetector"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={2} realityDataAccessClient={props.realityDataAccessClient}
                            placeholder={"Select meshes (context scene)"}
                            onSelectedDataChange={(select: string) => setS3DInput("meshes", select)}
                            realityDataType={["ContextScene"]}
                            selectedRealityData={(jobSettings as S3DJobSettings).inputs["meshes"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={3} realityDataAccessClient={props.realityDataAccessClient}
                            placeholder={"Select segmentation 3D (context scene)"}
                            onSelectedDataChange={(select: string) => setS3DInput("segmentation3D", select)}
                            realityDataType={["ContextScene"]}
                            selectedRealityData={(jobSettings as S3DJobSettings).inputs["segmentation3D"]} />
                    </div>
                </div>
            );
        default:
            return <></>;
        }
    };

    const getParametersControls = () => {
        switch(rdasJobType) {
        case RdasJobTypes.O2D:
            return (
                <div>
                    <div className="rdas-controls-group">
                        <div className="rdas-control">Min photos</div>
                        <Input className="rdas-input" value={(jobSettings as O2DJobSettings).options.minPhotos} size="small" 
                            step={1} type="number" max={1000} min={1} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setO2DParameter("minPhotos", parseInt(event.target.value))}/> 
                    </div>
                    <div className="rdas-controls-group">
                        <div className="rdas-control">Max dist</div>
                        <Input className="rdas-input" value={(jobSettings as O2DJobSettings).options.maxDist} size="small" 
                            step={1} type="number" max={1000} min={1} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setO2DParameter("maxDist", parseInt(event.target.value))}/> 
                    </div>
                    <div className="rdas-controls-group">
                        <ToggleSwitch className="rdas-control" label={"Use tie points"} checked={(jobSettings as O2DJobSettings).options.useTiePoints !== false} 
                            labelPosition={"left"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setO2DParameter("useTiePoints", e.target.checked);}}/>
                    </div>
                </div>
            );
        case RdasJobTypes.S2D:
            return (
                <div>
                    <div className="rdas-controls-group">
                        <div className="rdas-control">Min photos</div>
                        <Input className="rdas-input" value={(jobSettings as S2DJobSettings).options.minPhotos} size="small" 
                            step={1} type="number" max={1000} min={1} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setS2DParameter("minPhotos", parseInt(event.target.value))}/> 
                    </div>
                    <div className="rdas-controls-group">
                        <div className="rdas-control">Remove small components</div>
                        <Input className="rdas-input" value={(jobSettings as S2DJobSettings).options.removeSmallComponents} size="small" 
                            step={1} type="number" max={1000} min={1} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setS2DParameter("removeSmallComponents", parseInt(event.target.value))}/> 
                    </div>
                    <div className="rdas-controls-group">
                        <ToggleSwitch className="rdas-control" label={"Compute line width"} checked={(jobSettings as S2DJobSettings).options.computeLineWidth !== false} 
                            labelPosition={"left"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS2DParameter("computeLineWidth", e.target.checked);}}/>
                    </div>
                </div>
            );
        case RdasJobTypes.SOrtho:
            return <></>;
        case RdasJobTypes.S3D:
            return (
                <div>
                    <div className="rdas-controls-group">
                        <div className="rdas-control">Remove small components</div>
                        <Input className="rdas-input" value={(jobSettings as S3DJobSettings).options.removeSmallComponents} size="small" 
                            step={1} type="number" max={1000} min={1} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setS3DParameter("removeSmallComponents", parseInt(event.target.value))}/> 
                    </div>
                    <div className="rdas-controls-group">
                        <ToggleSwitch className="rdas-control" label={"Save confidence"} checked={(jobSettings as S3DJobSettings).options.saveConfidence !== false} 
                            labelPosition={"left"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS3DParameter("saveConfidence", e.target.checked);}}/>
                    </div>
                    <div className="rdas-controls-group">
                        <ToggleSwitch className="rdas-control" label={"Compute line width"} checked={(jobSettings as S3DJobSettings).options.computeLineWidth !== false} 
                            labelPosition={"left"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS3DParameter("computeLineWidth", e.target.checked);}}/>
                    </div>
                </div>
            );
        default:
            return <></>;
        }
    };

    const getOutputControls = () => {
        switch(rdasJobType){
        case RdasJobTypes.O2D:
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"objects2D"} checked={(jobSettings as O2DJobSettings).outputs.objects2D !== ""} 
                    labelPosition={"left"} disabled={true} />
            </div>);
        case RdasJobTypes.S2D:
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"segmentation2D"} checked={(jobSettings as S2DJobSettings).outputs.segmentation2D !== ""} 
                    labelPosition={"left"} disabled={true} />
                <ToggleSwitch className="rdas-control" label={"segmentedPhotos"} checked={(jobSettings as S2DJobSettings).outputs.segmentedPhotos !== ""} 
                    labelPosition={"left"} disabled={true} />
            </div>);
        case RdasJobTypes.SOrtho:
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"segmentation2D"} checked={(jobSettings as SOrthoJobSettings).outputs.segmentation2D !== ""} 
                    labelPosition={"left"} disabled={true} />
                <ToggleSwitch className="rdas-control" label={"segmentedPhotos"} checked={(jobSettings as S2DJobSettings).outputs.segmentedPhotos !== ""} 
                    labelPosition={"left"} disabled={true} />
            </div>);
        case RdasJobTypes.S3D:
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"segmentation3D"} checked={(jobSettings as S3DJobSettings).outputs.segmentation3D !== ""} 
                    labelPosition={"left"} disabled={true} />
            </div>);
        default:
            return <></>;
        }
    };

    const getOutputs = () => {
        switch(rdasJobType){
        case RdasJobTypes.O2D:
            return (<>
                {(jobSettings as O2DJobSettings).outputs.objects2D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="objects2D" disabled={true} 
                        value={(jobSettings as O2DJobSettings).outputs.objects2D === "objects2D" ? "" : (jobSettings as O2DJobSettings).outputs.objects2D}/>
                )}
            </>);
        case RdasJobTypes.S2D:
            return (<>
                {(jobSettings as S2DJobSettings).outputs.segmentation2D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation2D" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.segmentation2D === "segmentation2D" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.segmentation2D}/>
                )}
                {(jobSettings as S2DJobSettings).outputs.segmentedPhotos && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentedPhotos" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.segmentedPhotos === "segmentedPhotos" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.segmentedPhotos}/>
                )}
            </>);
        case RdasJobTypes.SOrtho:
            return (<>
                {(jobSettings as SOrthoJobSettings).outputs.segmentation2D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation2D" disabled={true} 
                        value={(jobSettings as SOrthoJobSettings).outputs.segmentation2D === "segmentation2D" 
                            ? "" : (jobSettings as SOrthoJobSettings).outputs.segmentation2D}/>
                )}
                {(jobSettings as S2DJobSettings).outputs.segmentedPhotos && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentedPhotos" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.segmentedPhotos === "segmentedPhotos" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.segmentedPhotos}/>
                )}
            </>);
        case RdasJobTypes.S3D:
            return (<>
                {(jobSettings as S3DJobSettings).outputs.segmentation3D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation3D" disabled={true} 
                        value={(jobSettings as S3DJobSettings).outputs.segmentation3D === "segmentation3D" 
                            ? "" : (jobSettings as S3DJobSettings).outputs.segmentation3D}/>
                )}
            </>);
        default:
            return <></>;
        }
    };

    return(
        <>
            <div className="rdas-controls-group">
                <h2 className="rdas-control">Run RDAS job</h2>
            </div>
            <div className="rdas-controls-group">
                <h4 className="rdas-control rdas-label">Select type</h4>
                <Select className="rdas-control rdas-input" placeholder="Job type" value={rdasJobType} options={selectOptions} onChange={onRdasJobTypeChange}/>
            </div>
            <div className="rdas-controls-group">
                <h4 className="rdas-control rdas-label">Name</h4>
                <Input className="rdas-control rdas-input" placeholder="Choose name" value={rdasJobName} 
                    onChange={onRdasJobNameChange}/>
            </div>
            {rdasJobType && (
                <div>
                    <hr className="rdas-sep" />
                    <div className="rdas-wrapper">
                        <div className="rdas-left">         
                            <div className="rdas-controls-group">
                                <h3 className="rdas-control">Inputs</h3>
                            </div>                                
                            {getInputControls()}
                        </div>
                        <div className="rdas-right">
                            <div className="rdas-controls-group">
                                <h3 className="rdas-control">Outputs</h3>
                            </div>
                            {getOutputControls()}
                            <div className="rdas-controls-group">
                                <h3 className="rdas-control">Parameters</h3>
                            </div>
                            {getParametersControls()}
                        </div>
                    </div>              
                    <div className="rdas-controls-group">
                        <h4 className="rdas-control rdas-label">Run/Cancel</h4>
                        <Button className="rdas-control" startIcon={<SvgPlay />} 
                            disabled={jobId !== ""} onClick={onJobRun}/>
                        <Button className="rdas-control" startIcon={<SvgStop />} disabled={jobId === ""} onClick={onJobCancel} />
                    </div>                   
                </div>
            )}
            {step && (
                <div className="rdas-controls-group">
                    <ProgressLinear className="rdas-progress" value={percentage} labels={[step, percentage + "%"]}/>
                </div>
            )}
            {rdasJobType && (
                <div>
                    <hr className="rdas-sep" />
                    <div className="rdas-controls-group">
                        <h3 className="rdas-control">Job results</h3>
                    </div>
                    <div className="rdas-controls-group">
                        {getOutputs()}
                    </div>     
                </div>
            )}     
        </>
    );
}