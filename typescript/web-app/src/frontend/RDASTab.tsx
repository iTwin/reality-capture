/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { sleep } from "@itwin/imodels-client-management";
import { Button, Input, LabeledInput, ProgressLinear, Select, SelectOption, ToggleSwitch } from "@itwin/itwinui-react";
import React, { ChangeEvent, MutableRefObject, useCallback, useEffect } from "react";
import "./RDASTab.css";
import { RealityDataAnalysisService } from "./sdk/rdas/RealityDataAnalysisService";
import { ClientInfo, JobState } from "./sdk/CommonData";
import { SPATokenFactory } from "./sdk/token/TokenFactoryBrowser";
import { JobSettings, L3DJobSettings, O2DJobSettings, S2DJobSettings } from "./sdk/rdas/Settings";
import { SelectRealityData } from "./SelectRealityData";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import { SvgPlay, SvgStop } from "@itwin/itwinui-icons-react";

enum RdasJobTypes {
    O2D = "objects2D",
    S2D = "segmentation2D",
    L3D = "lines3D",
}

interface RdasProps {
    realityDataAccessClient: RealityDataAccessClient;
    clientInfo: ClientInfo;
}

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
        { value: RdasJobTypes.S2D + "Ortho", label: RdasJobTypes.S2D + "Ortho" },
        { value: RdasJobTypes.L3D, label: RdasJobTypes.L3D },
    ];

    const initRdas = useCallback(async () => {
        const tokenFactory = new SPATokenFactory(props.clientInfo);
        realityDataAnalysisService.current = new RealityDataAnalysisService(tokenFactory);
    }, []);
    
    useEffect(() => {
        void initRdas();
    }, [initRdas]);

    const onRdasJobTypeChange = (selectedValue: string): void => {
        setRdasJobType(selectedValue);
        // Set a default output for each job type.
        if(selectedValue === "objects2D") {
            const settings = new O2DJobSettings();
            settings.outputs.objects2D = "objects2D";
            setJobSettings(settings);
        }
        else if(selectedValue === "segmentation2D" || selectedValue === "segmentation2DOrtho") {
            const settings = new S2DJobSettings();
            settings.outputs.segmentation2D = "segmentation2D";
            setJobSettings(settings);
        }
        else if(selectedValue === "lines3D") {
            const settings = new L3DJobSettings();
            settings.outputs.lines3D = "lines3D";
            setJobSettings(settings);
        }
    };

    const onRdasJobNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setRdasJobName(event.target.value);
    };
 
    const onJobRun = async (): Promise<void> => {
        setPercentage(0);
        setStep("Prepare step");
        const id = await realityDataAnalysisService.current.createJob(jobSettings, rdasJobName, process.env.IMJS_PROJECT_ID!);
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

    const setOrthoS2DInput = (input: "orthophoto" | "orthophotoSegmentationDetector", value: string): void => {
        const target = new S2DJobSettings();
        const settings = Object.assign(target, jobSettings as S2DJobSettings);
        settings.inputs[input] = value;
        setJobSettings(settings);
    };

    const setL3DInput = (input: "meshes" | "orientedPhotos" | "photoSegmentationDetector" | "segmentation3D" | "segmentation2D", value: string): void => {
        const target = new L3DJobSettings();
        const settings = Object.assign(target, jobSettings as L3DJobSettings);
        settings.inputs[input] = value;
        setJobSettings(settings);
    };

    const setS2DOutput = (output: "segmentation2D" | "polygons2D" | "lines2D" | "exportedPolygons2DSHP", isRequested: boolean): void => {
        const target = new S2DJobSettings();
        const settings = Object.assign(target, jobSettings as S2DJobSettings);
        settings.outputs[output] = isRequested ? output : "";
        setJobSettings(settings);
    };

    const setL3DOutput = (output: "segmentation2D" | "lines3D" | "exportedLines3DDGN" | "exportedLines3DCesium", isRequested: boolean): void => {
        const target = new L3DJobSettings();
        const settings = Object.assign(target, jobSettings as L3DJobSettings);
        settings.outputs[output] = isRequested ? output : "";
        setJobSettings(settings);
    };

    const onRemoveSmallComponentsChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const target = new L3DJobSettings();
        const settings = Object.assign(target, jobSettings as L3DJobSettings);
        settings.removeSmallComponents = Number(e.target.value);
        setJobSettings(settings);
    };

    const getInputControls = () => {
        switch(rdasJobType) {
        case "objects2D":
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
        case "segmentation2D":
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
        case "segmentation2DOrtho":
            return (
                <div>
                    <div className="rdas-control">
                        <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select orthophoto (context scene)"}
                            onSelectedDataChange={(select: string) => setOrthoS2DInput("orthophoto", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as S2DJobSettings).inputs["orthophoto"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={1} realityDataAccessClient={props.realityDataAccessClient} 
                            placeholder={"Select orthophoto segmentation detector"}
                            onSelectedDataChange={(select: string) => setOrthoS2DInput("orthophotoSegmentationDetector", select)}
                            realityDataType={["ContextDetector"]} 
                            selectedRealityData={(jobSettings as S2DJobSettings).inputs["orthophotoSegmentationDetector"]} />
                    </div>
                </div>
            );
        case "lines3D":
            return (
                <div>
                    <div className="rdas-control">
                        <SelectRealityData key={0} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select meshes (context scene)"} 
                            onSelectedDataChange={(select: string) => setL3DInput("meshes", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as L3DJobSettings).inputs["meshes"]} />
                    </div>
                    <div className="rdas-control">
                        <SelectRealityData key={2} realityDataAccessClient={props.realityDataAccessClient} 
                            placeholder={"Select oriented photos (context scene)"} 
                            onSelectedDataChange={(select: string) => setL3DInput("orientedPhotos", select)}
                            realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as L3DJobSettings).inputs["orientedPhotos"]} />
                    </div>
                    <div className="rdas-control">
                        <p className="rdas-controls-group">Detection : </p>
                        <div >
                            <SelectRealityData key={3} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select photo segmentation detector"} 
                                onSelectedDataChange={(select: string) => {
                                    setL3DInput("photoSegmentationDetector", select);
                                    setL3DInput("segmentation2D", "");
                                }}
                                realityDataType={["ContextDetector"]} selectedRealityData={(jobSettings as L3DJobSettings).inputs["photoSegmentationDetector"]} />    
                        </div>                       
                        <p className="rdas-controls-group"> OR </p>
                        <div >
                            <SelectRealityData key={4} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select segmentation2D (context scene)"} 
                                onSelectedDataChange={(select: string) => {
                                    setL3DInput("segmentation2D", select);
                                    setL3DOutput("segmentation2D", false);
                                    setL3DInput("photoSegmentationDetector", "");
                                }}
                                realityDataType={["ContextScene"]} selectedRealityData={(jobSettings as L3DJobSettings).inputs["segmentation2D"]} />
                        </div>
                    </div>                 
                </div>
            );
        default:
            return <></>;
        }
    };

    const getOutputControls = () => {
        switch(rdasJobType){
        case "objects2D":
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"objects2D"} checked={(jobSettings as O2DJobSettings).outputs.objects2D !== ""} 
                    labelPosition={"left"} disabled={true} />
            </div>);
        case "segmentation2D":
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"segmentation2D"} checked={(jobSettings as S2DJobSettings).outputs.segmentation2D !== ""} 
                    labelPosition={"left"} disabled={true} />
            </div>);
        case "segmentation2DOrtho":
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"segmentation2D"} checked={(jobSettings as S2DJobSettings).outputs.segmentation2D !== ""} 
                    labelPosition={"left"} disabled={true} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS2DOutput("segmentation2D", e.target.checked);}} />
                <ToggleSwitch className="rdas-control" label={"polygons2D"} checked={(jobSettings as S2DJobSettings).outputs.polygons2D !== ""} 
                    labelPosition={"left"} disabled={jobId !== ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS2DOutput("polygons2D", e.target.checked);}} />
                <ToggleSwitch className="rdas-control" label={"lines2D"} checked={(jobSettings as S2DJobSettings).outputs.lines2D !== ""} 
                    labelPosition={"left"} disabled={jobId !== ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS2DOutput("lines2D", e.target.checked);}} />
                <ToggleSwitch className="rdas-control" label={"exports"} checked={(jobSettings as S2DJobSettings).outputs.exportedPolygons2DSHP !== ""} 
                    labelPosition={"left"} disabled={jobId !== ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setS2DOutput("exportedPolygons2DSHP", e.target.checked);}} />
            </div>);
        case "lines3D":
            return (<div className="rdas-controls-group">
                <ToggleSwitch className="rdas-control" label={"lines3D"} checked={(jobSettings as L3DJobSettings).outputs.lines3D !== ""} 
                    labelPosition={"left"} disabled={true} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setL3DOutput("lines3D", e.target.checked);}} />  
                <ToggleSwitch className="rdas-control" label={"segmentation2D"} checked={(jobSettings as L3DJobSettings).outputs.segmentation2D !== ""} 
                    labelPosition={"left"} disabled={jobId !== "" || (jobSettings as L3DJobSettings).inputs.segmentation2D != ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setL3DOutput("segmentation2D", e.target.checked);}} />                         
                <ToggleSwitch className="rdas-control" label={"exports"} checked={(jobSettings as L3DJobSettings).outputs.exportedLines3DCesium !== ""} 
                    labelPosition={"left"} disabled={jobId !== ""} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setL3DOutput("exportedLines3DCesium", e.target.checked);
                        setL3DOutput("exportedLines3DDGN", e.target.checked);
                    }} />
            </div>);
        default:
            return <></>;
        }
    };

    const getOutputs = () => {
        switch(rdasJobType){
        case "objects2D":
            return (<>
                {(jobSettings as O2DJobSettings).outputs.objects2D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="objects2D" disabled={true} 
                        value={(jobSettings as O2DJobSettings).outputs.objects2D === "objects2D" ? "" : (jobSettings as O2DJobSettings).outputs.objects2D}/>
                )}
            </>);
        case "segmentation2D":
        case "segmentation2DOrtho":
            return (<>
                {(jobSettings as S2DJobSettings).outputs.segmentation2D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation2D" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.segmentation2D === "segmentation2D" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.segmentation2D}/>
                )}
                {(jobSettings as S2DJobSettings).outputs.polygons2D &&(
                    <LabeledInput className="rdas-control" displayStyle="inline" label="polygons2D" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.polygons2D === "polygons2D" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.polygons2D}/>
                )}
                {(jobSettings as S2DJobSettings).outputs.lines2D &&(
                    <LabeledInput className="rdas-control" displayStyle="inline" label="lines2D" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.lines2D === "lines2D" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.lines2D}/>
                )}
                {(jobSettings as S2DJobSettings).outputs.exportedPolygons2DSHP &&(
                    <LabeledInput className="rdas-control" displayStyle="inline" label="exportedPolygons2DSHP" disabled={true} 
                        value={(jobSettings as S2DJobSettings).outputs.exportedPolygons2DSHP === "exportedPolygons2DSHP" 
                            ? "" : (jobSettings as S2DJobSettings).outputs.exportedPolygons2DSHP}/>
                )}
            </>);
        case "lines3D":
            return (<>
                {(jobSettings as L3DJobSettings).outputs.lines3D &&(
                    <LabeledInput className="rdas-control" displayStyle="inline" label="lines3D" disabled={true} 
                        value={(jobSettings as L3DJobSettings).outputs.lines3D === "lines3D" 
                            ? "" : (jobSettings as L3DJobSettings).outputs.lines3D}/>
                )}
                {(jobSettings as L3DJobSettings).outputs.segmentation2D && (
                    <LabeledInput className="rdas-control" displayStyle="inline" label="segmentation2D" disabled={true} 
                        value={(jobSettings as L3DJobSettings).outputs.segmentation2D === "segmentation2D" 
                            ? "" : (jobSettings as L3DJobSettings).outputs.segmentation2D}/>
                )}               
                {(jobSettings as L3DJobSettings).outputs.exportedLines3DCesium &&(
                    <LabeledInput className="rdas-control" displayStyle="inline" label="exportedLines3DCesium" disabled={true} 
                        value={(jobSettings as L3DJobSettings).outputs.exportedLines3DCesium === "exportedLines3DCesium" 
                            ? "" : (jobSettings as L3DJobSettings).outputs.exportedLines3DCesium}/>
                )}
                {(jobSettings as L3DJobSettings).outputs.exportedLines3DDGN &&(
                    <LabeledInput className="rdas-control" displayStyle="inline" label="exportedLines3DDGN" disabled={true} 
                        value={(jobSettings as L3DJobSettings).outputs.exportedLines3DDGN === "exportedLines3DDGN" 
                            ? "" : (jobSettings as L3DJobSettings).outputs.exportedLines3DDGN}/>
                )}
            </>);
        default:
            return <></>;
        }
    };

    return(
        <div>
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
                            {rdasJobType === "lines3D" && (
                                <div>
                                    <div className="rdas-controls-group">
                                        <h3 className="rdas-control">Parameters</h3>
                                    </div>
                                    <div className="rdas-controls-group">
                                        <h3 className="rdas-control">Remove lines shorter than</h3>
                                        <Input className="rdas-input" value={(jobSettings as L3DJobSettings).removeSmallComponents} size="small" 
                                            step={0.01} type="number" max={1000} min={0} onChange={onRemoveSmallComponentsChange}/> 
                                    </div>
                                </div>
                            )}
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
        </div>
    );
}