/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as dotenv from "dotenv";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import {
  CalibrationInputs, CalibrationSpecificationsCreate, CalibrationOptions, CalibrationOutputs,
  CalibrationOutputsCreate, FillImagePropertiesInputs, FillImagePropertiesSpecificationsCreate,
  FillImagePropertiesOutputsCreate, FillImagePropertiesOptions, FillImagePropertiesOutputs,
  RealityCaptureService, ReconstructionSpecificationsCreate, ReconstructionInputs, ReconstructionOutputsCreate,
  ReconstructionOutputs, ExportCreate, Format, OptionsLAS, SamplingStrategy, TilingOptions, GeometricPrecision,
  JobCreate, JobType, JobState, Progress, getAppropriateService, RealityDataHandler
} from "@itwin/reality-capture";
import { RealityDataClientOptions, RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function runModelingExample() {
  /**
   * This example shows how to submit a Reconstruction job and get a LAS from images
   */

  // Inputs to provide. Please, adapt values
  const imagesPath = "D:/Datasets/Helico/Images";
  const outputPath = "D:/Datasets/Helico/LAS";

  // Optional : sampling distance (in meter). Please, set to undefined if you don't want to specify sampling distance
  const samplingDistance: number | undefined = 0.5;
  // Optional : srs used in outputs. Please, set to undefined if you don't want to specify srs
  const crs: string | undefined = "EPSG:32631";

  // Optional : images reality data name
  const imagesRealityDataName = "Reality Capture SDK sample images"
  // Optional : jobs name
  const fipJobName = "Reality Capture SDK FillImageProperties job example";
  const calibJobName = "Reality Capture SDK Calibration job example";
  const reconsJobName = "Reality Capture SDK Reconstruction job example";

  // Script
  dotenv.config();

  const iTwinId = process.env.IMJS_ITWIN_ID ?? "";
  const clientId = process.env.IMJS_CLIENT_ID ?? "";
  const secret = process.env.IMJS_CLIENT_SECRET ?? "";
  const issuerUrl = "https://ims.bentley.com";

  const authorizationClient = new ServiceAuthorizationClient({
    clientId: clientId,
    scope: "itwin-platform",
    clientSecret: secret,
    authority: issuerUrl,
  });

  const realityCaptureService = new RealityCaptureService(authorizationClient);
  console.log("Reality Capture service initialized");

  const realityDataHandler = new RealityDataHandler(authorizationClient);
  console.log("Reality Data handler initialized");

  const realityDataClientOptions: RealityDataClientOptions = {
    authorizationClient: authorizationClient,
    baseUrl: "https://api.bentley.com/reality-management/reality-data",
  };
  const realityDataClient = new RealityDataAccessClient(realityDataClientOptions);
  console.log("Reality Data Client initialized");

  // Function to monitor job progress
  let monitorJob = async (jobId: string) => {
    let progress: Progress = { state: JobState.QUEUED, percentage: 0 };
    while (progress.state !== JobState.CANCELLED && progress.state !== JobState.FAILED && progress.state !== JobState.SUCCESS) {
      const response = await realityCaptureService.getJobProgress(jobId, getAppropriateService(JobType.RECONSTRUCTION));
      if (response.isError()) {
        console.log("Can't get job progress");
      }
      progress = response.value!;
      console.log("progress : ", progress.percentage);
      await sleep(10000);
      if (progress.state === JobState.CANCELLED || progress.state === JobState.FAILED) {
        console.log("Job not completed");
      }
      else if (progress.state === JobState.SUCCESS) {
        console.log("Job completed");
      }
    }
  };

  try {
    console.log("Upload images in ", iTwinId);
    const realityData = new ITwinRealityData(realityDataClient, undefined, iTwinId);
    realityData.displayName = imagesRealityDataName;
    realityData.type = "CCImageCollection";
    const createdRealityData = await realityDataClient.createRealityData("", iTwinId, realityData);
    const uploadResponse = await realityDataHandler.uploadData(createdRealityData.id, imagesPath, "", iTwinId);
    if (uploadResponse.isError()) {
      console.log("Failed to upload reality data : " + uploadResponse.error!.error.message);
      return;
    }
    console.log("Successfully uploaded images");

    // Submit FillImageProperties job to get a context scene from the images
    let fipInputs: FillImagePropertiesInputs = { imageCollections: [createdRealityData.id] };
    let fipOutputs = [FillImagePropertiesOutputsCreate.SCENE];
    let fipOptions: FillImagePropertiesOptions = {};
    let fipSpecs: FillImagePropertiesSpecificationsCreate = { inputs: fipInputs, outputs: fipOutputs, options: fipOptions };
    let fipJobToSubmit: JobCreate = { name: fipJobName, specifications: fipSpecs, type: JobType.FILL_IMAGE_PROPERTIES, iTwinId: iTwinId };
    const submitFipResponse = await realityCaptureService.submitJob(fipJobToSubmit);
    if (submitFipResponse.isError()) {
      console.log("Failed to submit FillImageProperties job : " + submitFipResponse.error!.error.message);
      return;
    }
    const fipJobId = submitFipResponse.value!.id;
    console.log("FillImageProperties job submitted");
    await monitorJob(fipJobId);
    const fipPropertiesResponse = await realityCaptureService.getJob(fipJobId, getAppropriateService(JobType.FILL_IMAGE_PROPERTIES));
    if (fipPropertiesResponse.isError()) {
      console.log("Failed to retrieve FillImageProperties job properties : " + submitFipResponse.error!.error.message);
      return;
    }
    const fipOutputContextScene = (fipPropertiesResponse.value!.specifications.outputs as FillImagePropertiesOutputs).scene;

    // Submit Calibration job to get an oriented context scene
    let calibInputs: CalibrationInputs = { scene: fipOutputContextScene };
    let calibOutputs = [CalibrationOutputsCreate.SCENE];
    let calibOptions: CalibrationOptions = {};
    let calibSpecs: CalibrationSpecificationsCreate = { inputs: calibInputs, outputs: calibOutputs, options: calibOptions };
    let calibJobToSubmit: JobCreate = { name: calibJobName, specifications: calibSpecs, type: JobType.CALIBRATION, iTwinId: iTwinId };
    const submitCalibResponse = await realityCaptureService.submitJob(calibJobToSubmit);
    if (submitCalibResponse.isError()) {
      console.log("Failed to submit Calibration job : " + submitCalibResponse.error!.error.message);
      return;
    }
    const calibJobId = submitCalibResponse.value!.id;
    console.log("Calibration job submitted");
    await monitorJob(calibJobId);
    const calibPropertiesResponse = await realityCaptureService.getJob(calibJobId, getAppropriateService(JobType.CALIBRATION));
    if (calibPropertiesResponse.isError()) {
      console.log("Failed to retrieve Calibration job properties : " + submitCalibResponse.error!.error.message);
      return;
    }
    const calibOutputContextScene = (calibPropertiesResponse.value!.specifications.outputs as CalibrationOutputs).scene;

    // Submit Reconstruction job to generate the LAS
    let reconsInputs: ReconstructionInputs = { scene: calibOutputContextScene };
    let lasOptions: OptionsLAS = {};
    if (crs) {
      lasOptions.crs = crs;
    }
    if (samplingDistance) {
      lasOptions.samplingStrategy = SamplingStrategy.ABSOLUTE;
      lasOptions.samplingDistance = samplingDistance;
    }
    let exp: ExportCreate = { format: Format.LAS, options: lasOptions };
    let tilingOptions: TilingOptions = { geometricPrecision: GeometricPrecision.EXTRA };
    let reconsOutputs: ReconstructionOutputsCreate = { exports: [exp] };
    let reconsSpecs: ReconstructionSpecificationsCreate = { inputs: reconsInputs, outputs: reconsOutputs, options: tilingOptions };
    let reconsJobToSubmit: JobCreate = { name: reconsJobName, specifications: reconsSpecs, type: JobType.RECONSTRUCTION, iTwinId: iTwinId };
    const submitReconsResponse = await realityCaptureService.submitJob(reconsJobToSubmit);
    if (submitReconsResponse.isError()) {
      console.log("Failed to submit Reconstruction job : " + submitReconsResponse.error!.error.message);
      return;
    }
    const reconsJobId = submitReconsResponse.value!.id;
    console.log("Reconstruction job submitted");
    await monitorJob(reconsJobId);

    console.log("Downloading Reconstruction LAS output");
    const reconsPropertiesResponse = await realityCaptureService.getJob(reconsJobId, getAppropriateService(JobType.RECONSTRUCTION));
    if (reconsPropertiesResponse.isError()) {
      console.log("Failed to retrieve Reconstruction job properties : " + submitReconsResponse.error!.error.message);
      return;
    }
    const reconsDownloadResponse = await realityDataHandler.downloadData((reconsPropertiesResponse.value!.specifications.outputs as ReconstructionOutputs).exports![0].location, outputPath, "", iTwinId);
    if (reconsDownloadResponse.isError()) {
      console.log("Failed to download Reconstruction LAS output : " + submitReconsResponse.error!.error.message);
      return;
    }
    console.log("Successfully downloaded Reconstruction LAS output");
  }
  catch (error: any) {
    console.log(error);
  }
}

runModelingExample();