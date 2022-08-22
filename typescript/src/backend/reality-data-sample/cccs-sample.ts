/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContextCaptureCloud } from "../reality-data/Cccs";
import { getTokenFromEnv } from "../reality-data/Utils";
import { IModelHost } from "@itwin/core-backend";
import { AccessToken } from "@itwin/core-bentley";
import { RealityDataClientBase } from "../reality-data/Rds";
import { RealityDataTransfer } from "../reality-data/RealityDataTransfer";
import { ApiUtils } from "../reality-data/ApiUtils";

export class ContextCaptureCloudSample extends ContextCaptureCloud {
    private imageCollectionId : string|undefined;
    private ccOrientationsId_start : string|undefined;
    private ccOrientationsId_calib : string|undefined;
    private reconstructionId : string|undefined;
    private realityDataClient: RealityDataClientBase;
    
    constructor(accessToken : AccessToken)
    {
        super(accessToken);
        this.realityDataClient = new RealityDataClientBase(accessToken);
    }

    // Prepare on RDS the images necessary to run processing on CCS
    public async prepareImageDataForCCS(imageCollectionId: string|undefined, localPath: string|undefined) 
    {
        // Image collection
        if (typeof imageCollectionId === "undefined")
        {
            const ic = await this.realityDataClient.createItemRDS("CCS Sample App", "CCImageCollection", "An image Collection for the CCS Sample App");
            console.log("Image collection RealityData created: ", ic.id);
            console.log("Uploading image collection to RealityData");
            imageCollectionId = ic.id as string;
            await RealityDataTransfer.Instance.uploadRealityData(imageCollectionId, localPath!, this.realityDataClient);
        }
        this.imageCollectionId = imageCollectionId;
    }

    public async runCalibrationJobCCS(calibrationJobId: string|undefined, ccOrientationsId_calib : string|undefined)
    {   
        if (typeof(ccOrientationsId_calib) === "undefined")
        {
            // Create the calibration job if needed
            if (typeof calibrationJobId === "undefined")
            {
                //--- Create CCS calibration job
                const res = await ApiUtils.SubmitRequest("CCS calibration job creation", this.headers, this.getCCSBase() + "jobs", "POST", [201],
                    {
                        type : "Calibration",
                        name : "CCS sample app calibration job",
                        workspaceId : this.workspaceId,
                        inputs: [  // inconsistent with RDAS (input is not part of Settings)
                            {
                                id: this.imageCollectionId,
                                description : "CCS sample app image collection"
                            },
                            {
                                id: this.ccOrientationsId_start,
                                description : "CCS sample app CCOrientation"
                            }
                        ],

                        settings : {
                            meshQuality : "Medium",
                            processingEngines: 0,
                            outputs : ["CCOrientations"]
                        }
                    }) as any;
                console.log("CCS calibration job creation result: ", res.job);
                calibrationJobId = res.job.id;

                //--- Add data for Job estimate -- TODO

                //--- Submit job
                await ApiUtils.SubmitRequest("CCS Calibration job submission", this.headers, this.getCCSBase() + "jobs/" + calibrationJobId, "PATCH", [200],
                    {
                        state: "active"
                    });

                //--- Monitor calibration job
                await this.monitorJobCCS(calibrationJobId as string);
            }

            // Get job result
            const res = await ApiUtils.SubmitRequest("Get job result", this.headers, this.getCCSBase() + "jobs/" + calibrationJobId, "GET", [200]) as any;
            console.log("CCS calibration job result:", res.job);
            ccOrientationsId_calib = res.job.jobSettings.outputs[0].id;
        }
        this.ccOrientationsId_calib = ccOrientationsId_calib;
        console.log("Output ccOrientations Id : ", this.ccOrientationsId_calib);
    }

    // Prepare on RDS the CCOrientation data necessary for CCS
    // either to start calibration/full reconstruction (isInput===true), or to start reconstruction (isInput===false)
    public async prepareCCOrientationDataForCCS(isInput: boolean, ccOriId: string|undefined, localPath: string|undefined) 
    {
        // CCOrientation
        if (typeof ccOriId === "undefined")
        {
            const ic = await this.realityDataClient.createItemRDS("CCS Sample App", "CCOrientations", "Image orientations for the CCS Sample App");
            console.log("Image orientation RealityData created: ", ic.id);
            console.log("Uploading image orientation to RealityData");
            ccOriId = ic.id as string;
            await RealityDataTransfer.Instance.uploadRealityData(ccOriId, localPath!, this.realityDataClient);
        }
        if (isInput)
            this.ccOrientationsId_start = ccOriId;
        else
            this.ccOrientationsId_calib = ccOriId;
    }

    public async finalizeOutputData(realityDataId : string, projectId : string)
    {
        ApiUtils.SubmitRequest("Associate Project", this.headers, this.realityDataClient.getRDSBase() + realityDataId + "/projects/" + projectId, "PUT", [201], {});
    }

    public async runJob(doCalibration : boolean, doReconstruction : boolean) 
    {
        const isFull : boolean = (!doCalibration) && (!doReconstruction); // Convention : if none is true, do a 'Full' reconstruction
        let imgCollectionId: string|undefined;
        let imgCollectionLocalPath: string|undefined;
        let ccOrientationsId_input: string|undefined; // CC Orientation used as input to Calibration / Full jobs
        let ccOrientations_input_LocalPath: string|undefined;
        let ccOrientationsId_calib: string|undefined;
        let ccOrientations_calib_LocalPath: string|undefined;

        const workspaceId = "";
        let calibrationJobId: string|undefined;

        // to re-use existing reality data and avoid uploading : uncomment some or all lines below + replace id's
        if (isFull || doCalibration)
        {
            // New CCOrientation with photo bulk
            // imgCollectionId = '6d6e03c5-118a-425a-8a20-6a5587feac27'; // PROD
            // ccOrientationsId_input = 'cc15fdc9-c64a-4fff-b65e-691b446db8c9'; // PROD
            imgCollectionId = "94092070-4e30-4012-a726-37552f56cda3"; // QA
            imgCollectionLocalPath = "D:/iTwin/CCS/input/Helico"; // QA

            imgCollectionLocalPath = "D:/iTwin/CCS/input/Helico";
            ccOrientations_input_LocalPath = "D:/iTwin/CCS/input/HelicoOrientation";
        }

        // In all cases, upload images to RDS if needed
        await this.prepareImageDataForCCS(imgCollectionId, imgCollectionLocalPath);

        if (doCalibration || isFull)
            await this.prepareCCOrientationDataForCCS(true, ccOrientationsId_input, ccOrientations_input_LocalPath); // will need calib
        else
            await this.prepareCCOrientationDataForCCS(false, ccOrientationsId_input, ccOrientations_calib_LocalPath); // Start from calibrated images

        await this.createWorkspaceCCS(workspaceId);

        if (doCalibration && !isFull)
            await this.runCalibrationJobCCS(calibrationJobId, ccOrientationsId_input);

        const jobInputs = new Map();
        jobInputs.set(this.imageCollectionId, "CCS sample app image collection");
        jobInputs.set(isFull ? this.ccOrientationsId_start : this.ccOrientationsId_calib, "CCS sample app CCOrientation");
        const outputs = await this.runReconstructionJobCCS(isFull, jobInputs);
        /// TODO: CHECK IF JOB FAILED
        if (isFull)
        {
            this.ccOrientationsId_calib = outputs[0];
            console.log("Output CCOrientations Id : ", this.ccOrientationsId_calib);
        }
        this.reconstructionId = outputs[isFull ? 1 : 0];

        await this.finalizeOutputData(this.reconstructionId!, this.projectId);
        console.log("Run CCS: DONE");
    }

    public async Run() 
    {
        // this.runJob(false, true); // Run Reconstruction without Calibration
        this.runJob(false, false); // Run Full (calibration+reconstruction at once)
        // this.runJob(true, true); // Run Calibration, then Reconstruction
    }
}

export async function ccs_sample_main(token: AccessToken|undefined = undefined)
{
    if (typeof(token) === undefined)
        token = await getTokenFromEnv();

    const ccsSample = new ContextCaptureCloudSample(token as AccessToken);

    await ccsSample.Run().catch((err: any) => 
    {
        console.log(err);
        console.error("Error running Context Capture Cloud Service sample:", err.message);
    });

    await IModelHost.shutdown();
}