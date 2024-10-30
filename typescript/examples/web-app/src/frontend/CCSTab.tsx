/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SvgPlay, SvgStop } from "@itwin/itwinui-icons-react";
import { Button, Input, LabeledInput, ProgressLinear } from "@itwin/itwinui-react";
import { RealityDataAccessClient } from "@itwin/reality-data-client";
import React, { ChangeEvent, MutableRefObject, useCallback, useEffect } from "react";
import "./CCSTab.css";
import { SelectRealityData } from "./SelectRealityData";
import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { CCJobSettings, CCJobType, ContextCaptureService } from "@itwin/reality-capture-modeling";
import { JobState } from "@itwin/reality-capture-common";

interface CcProps {
    realityDataAccessClient: RealityDataAccessClient;
    authorizationClient: BrowserAuthorizationClient;
}

async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export function ContextCapture(props: CcProps) {
    const [step, setStep] = React.useState<string>("");
    const [percentage, setPercentage] = React.useState<number>(0);
    const [jobSettings, setJobSettings] = React.useState<CCJobSettings>(new CCJobSettings());
    const [jobId, setJobId] = React.useState<string>("");
    const [photosId, setPhotosId] = React.useState<string>("");
    const [ccOrientationsId, setCcOrientationsId] = React.useState<string>("");
    const [jobName, setJobName] = React.useState<string>("");

    const contextCaptureService = React.useRef() as MutableRefObject<ContextCaptureService>;

    const initCc = useCallback(async () => {
        const prefix = import.meta.env.IMJS_URL_PREFIX ?? "";
        contextCaptureService.current = new ContextCaptureService(props.authorizationClient.getAccessToken.bind(props.authorizationClient), prefix);
    }, []);

    useEffect(() => {
        void initCc();
    }, [initCc]);

    const onJobRun = async (): Promise<void> => {
        setPercentage(0);
        setStep("Prepare step");

        const settings = jobSettings;
        settings.outputs.orientations = "orientations";
        settings.outputs.cesium3DTiles = "cesium3DTiles";

        const workspaceId = await contextCaptureService.current.createWorkspace(jobName + " workspace", 
            import.meta.env.IMJS_PROJECT_ID!);
        const id = await contextCaptureService.current.createJob(CCJobType.FULL, settings, jobName, workspaceId);
        await contextCaptureService.current.submitJob(id);
        setJobId(id);

        let done = false;
        while (!done) {
            const progress = await contextCaptureService.current.getJobProgress(id);
            setPercentage(progress.progress);
            setStep(progress.step);

            if (progress.state === JobState.SUCCESS || progress.state === JobState.OVER) {
                done = true;
            }
            else if (progress.state === JobState.ACTIVE) {
                console.log("Progress: " + progress.progress + ", step: " + progress.step);
            }
            else if (progress.state === JobState.CANCELLED) {
                console.log("Job cancelled");
                return;
            }
            else if (progress.state === JobState.FAILED) {
                console.log("Job failed");
                done = true;
            }
            await sleep(6000);
        }

        const properties = await contextCaptureService.current.getJobProperties(id);
        setJobSettings(properties.settings);
        setJobId("");
    };

    const onJobCancel = async (): Promise<void> => {
        await contextCaptureService.current.cancelJob(jobId);
    };

    const onPhotosIdChange = async (select: string): Promise<void> => {
        const settings = jobSettings;
        settings.inputs.push(select);
        setJobSettings(settings);
        setPhotosId(select);
    };

    const onCcOrientationsIdChange = async (select: string): Promise<void> => {
        const settings = jobSettings;
        settings.inputs.push(select);
        setJobSettings(settings);
        setCcOrientationsId(select);
    };

    const onCCJobNameChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        setJobName(event.target.value);
    };

    return (
        <div>
            <div className="ccs-controls-group">
                <h2 className="ccs-control">Run Context Capture job</h2>
            </div>
            <div className="ccs-controls-group">
                <h4 className="ccs-control">Name</h4>
                <Input className="ccs-control ccs-input" placeholder="Choose name" value={jobName} 
                    onChange={onCCJobNameChange}/>
            </div>
            <hr className="ccs-sep" />
            <div className="ccs-controls-group">
                <h3 className="ccs-control">Inputs</h3>
            </div>
            <div className="ccs-control">
                <SelectRealityData key={20} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select images"}
                    onSelectedDataChange={onPhotosIdChange} selectedRealityData={photosId} realityDataType={["CCImageCollection"]} />
            </div>
            <div className="ccs-control">
                <SelectRealityData key={21} realityDataAccessClient={props.realityDataAccessClient} placeholder={"Select cc orientations"}
                    onSelectedDataChange={onCcOrientationsIdChange} selectedRealityData={ccOrientationsId}
                    realityDataType={["CCOrientations"]} />
            </div>
            <div className="ccs-controls-group">
                <Button className="ccs-control" startIcon={<SvgPlay />}
                    disabled={photosId === "" || ccOrientationsId === "" || jobId !== ""} onClick={onJobRun} />
                <Button className="ccs-control" startIcon={<SvgStop />} disabled={jobId === ""} onClick={onJobCancel} />
            </div>
            {step && (
                <div className="ccs-controls-group">
                    <ProgressLinear className="ccs-progress" value={percentage} labels={[step, percentage + "%"]} />
                </div>
            )}
            <hr className="ccs-sep" />
            <div className="ccs-controls-group">
                <h3 className="ccs-control">Outputs</h3>
            </div>
            <div className="ccs-controls-group">
                <LabeledInput className="ccs-control" displayStyle="inline" label="CCorientation" disabled={true}
                    value={jobSettings.outputs.orientations === "orientations" ? "" : jobSettings.outputs.orientations}                 
                />
                <LabeledInput className="ccs-control" displayStyle="inline" label="Cesium 3D tiles" disabled={true}
                    value={jobSettings.outputs.cesium3DTiles === "cesium3DTiles" ? "" : jobSettings.outputs.cesium3DTiles} />
            </div>
        </div>
    );
}