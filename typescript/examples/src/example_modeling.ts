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
  JobCreate, JobType, JobState, Progress, getAppropriateService, RealityDataHandler,
  Options3DTiles, BucketDataHandler, AdjustmentConstraints,
  LODScope
} from "@itwin/reality-capture";
import { RealityDataClientOptions, RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";
import path from "path";


export async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function monitorJob(realityCaptureService: RealityCaptureService, jobId: string) {
  // Monitor job progress every 10s
  let progress: Progress = { state: JobState.QUEUED, percentage: 0 };
  while (progress.state !== JobState.CANCELLED && progress.state !== JobState.FAILED && progress.state !== JobState.SUCCESS) {
    const response = await realityCaptureService.getJobProgress(jobId, getAppropriateService(JobType.RECONSTRUCTION));
    if (response.isError()) {
      console.log("Can't get job progress");
    }
    progress = response.value!;
    console.log("Progress : ", progress.percentage);
    await sleep(10000);
    if (progress.state === JobState.CANCELLED || progress.state === JobState.FAILED) {
      console.log("Job not completed");
    }
    else if (progress.state === JobState.SUCCESS) {
      console.log("Job completed");
    }
  }
}

async function runFillImageProperties(realityCaptureService: RealityCaptureService, imagesRealityData: ITwinRealityData, fipJobName: string, iTwinId: string): Promise<string> {
  // Submit FillImageProperties job to get a context scene from the images
  let fipInputs: FillImagePropertiesInputs = { imageCollections: [imagesRealityData.id] };
  let fipOutputs = [FillImagePropertiesOutputsCreate.SCENE];
  let fipOptions: FillImagePropertiesOptions = {};
  let fipSpecs: FillImagePropertiesSpecificationsCreate = { inputs: fipInputs, outputs: fipOutputs, options: fipOptions };
  let fipJobToSubmit: JobCreate = { name: fipJobName, specifications: fipSpecs, type: JobType.FILL_IMAGE_PROPERTIES, iTwinId: iTwinId };
  const submitFipResponse = await realityCaptureService.submitJob(fipJobToSubmit);
  if (submitFipResponse.isError()) {
    throw new Error("Failed to submit FillImageProperties job : " + submitFipResponse.error!.error.message);
  }
  const fipJobId = submitFipResponse.value!.id;
  console.log("FillImageProperties job submitted");
  await monitorJob(realityCaptureService, fipJobId);
  const fipPropertiesResponse = await realityCaptureService.getJob(fipJobId, getAppropriateService(JobType.FILL_IMAGE_PROPERTIES));
  if (fipPropertiesResponse.isError()) {
    throw new Error("Failed to retrieve FillImageProperties job properties : " + fipPropertiesResponse.error!.error.message);
  }
  return (fipPropertiesResponse.value!.specifications.outputs as FillImagePropertiesOutputs).scene;
}

async function runCalibration(realityCaptureService: RealityCaptureService, bucketDataHandler: BucketDataHandler, fipOutputContextScene: string, calibJobName: string, outputPath: string, iTwinId: string, calibOptions: CalibrationOptions): Promise<string> {
  // Submit Calibration job to get an oriented context scene
  let calibInputs: CalibrationInputs = { scene: fipOutputContextScene };
  let calibOutputs = [CalibrationOutputsCreate.SCENE, CalibrationOutputsCreate.REPORT];
  let calibSpecs: CalibrationSpecificationsCreate = { inputs: calibInputs, outputs: calibOutputs, options: calibOptions };
  let calibJobToSubmit: JobCreate = { name: calibJobName, specifications: calibSpecs, type: JobType.CALIBRATION, iTwinId: iTwinId };
  const submitCalibResponse = await realityCaptureService.submitJob(calibJobToSubmit);
  if (submitCalibResponse.isError()) {
    throw new Error("Failed to submit Calibration job : " + submitCalibResponse.error!.error.message);
  }
  const calibJobId = submitCalibResponse.value!.id;
  console.log("Calibration job submitted");
  await monitorJob(realityCaptureService, calibJobId);
  const calibPropertiesResponse = await realityCaptureService.getJob(calibJobId, getAppropriateService(JobType.CALIBRATION));
  if (calibPropertiesResponse.isError()) {
    throw new Error("Failed to retrieve Calibration job properties : " + calibPropertiesResponse.error!.error.message);
  }
  const outputs = calibPropertiesResponse.value!.specifications.outputs as CalibrationOutputs;
  const chars = outputs.report!.split(":"); // Remove 'bkt:' from the report bucket path
  const calibDownloadResponse = await bucketDataHandler.downloadData(iTwinId, path.join(outputPath, "Report"), chars[1]);
  if (calibDownloadResponse.isError()) {
    throw new Error("Failed to download report " + calibDownloadResponse.error!.error.message);
  }
  return (calibPropertiesResponse.value!.specifications.outputs as CalibrationOutputs).scene;
}

async function runReconstruction(realityCaptureService: RealityCaptureService, realityDataHandler: RealityDataHandler, calibOutputContextScene: string, reconsJobName: string, outputPath: string, iTwinId: string,
  lasOptions: OptionsLAS, tiles3dOptions: Options3DTiles) {
  // Submit Reconstruction job to generate the LAS
  let reconsInputs: ReconstructionInputs = { scene: calibOutputContextScene };
  let exportLas: ExportCreate = { format: Format.LAS, options: lasOptions };
  let export3dTiles: ExportCreate = { format: Format.THREED_TILES, options: tiles3dOptions };
  let reconsOutputs: ReconstructionOutputsCreate = { exports: [exportLas, export3dTiles] };
  let tilingOptions: TilingOptions = { geometricPrecision: GeometricPrecision.EXTRA };
  let reconsSpecs: ReconstructionSpecificationsCreate = { inputs: reconsInputs, outputs: reconsOutputs, options: tilingOptions };
  let reconsJobToSubmit: JobCreate = { name: reconsJobName, specifications: reconsSpecs, type: JobType.RECONSTRUCTION, iTwinId: iTwinId };
  const submitReconsResponse = await realityCaptureService.submitJob(reconsJobToSubmit);
  if (submitReconsResponse.isError()) {
    throw new Error("Failed to submit Reconstruction job : " + submitReconsResponse.error!.error.message);
  }
  const reconsJobId = submitReconsResponse.value!.id;
  console.log("Reconstruction job submitted");
  await monitorJob(realityCaptureService, reconsJobId);

  console.log("Downloading Reconstruction LAS output");
  const reconsPropertiesResponse = await realityCaptureService.getJob(reconsJobId, getAppropriateService(JobType.RECONSTRUCTION));
  if (reconsPropertiesResponse.isError()) {
    throw new Error("Failed to retrieve Reconstruction job properties : " + reconsPropertiesResponse.error!.error.message);
  }
  const outputs = reconsPropertiesResponse.value!.specifications.outputs as ReconstructionOutputs;
  for(let reconsExport of outputs.exports!)
  {
    const reconsDownloadResponse = await realityDataHandler.downloadData(reconsExport.location, path.join(outputPath, reconsExport.format), "", iTwinId);
    if (reconsDownloadResponse.isError()) {
      throw new Error("Failed to download export " +  reconsExport.format +  " : " + reconsDownloadResponse.error!.error.message);
    }
  }
  console.log("Successfully downloaded Reconstruction LAS output");
}


async function runModelingExample() {
  /**
   * This example shows how to submit a Reconstruction job and get a LAS from images
   */

  // Inputs to provide. Please, adapt values
  const imagesPath = "D:/Datasets/Helico/Images";
  const outputPath = "D:/Datasets/Helico/Results";

  // Options for calibration
  const calibOptions: CalibrationOptions = {
    adjustmentConstraints: [AdjustmentConstraints.POSITION_METADATA] // Adjustment from photos position metadata
  };

  // Options for Reconstruction LAS export
  const lasOptions: OptionsLAS = {
    samplingDistance: 0.5, // sampling distance (in meter).
    samplingStrategy: SamplingStrategy.ABSOLUTE,
    crs: "EPSG:32631" // CRS used for this export
  }
  // Options for Reconstruction 3DTiles export
  const tiles3dOptions: Options3DTiles = {
    lodScope: LODScope.ACROSS_TILES // produce global LOD structure (e.g., a quadtree) for an entire reconstruction
  }

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

  const bucketDataHandler = new BucketDataHandler(authorizationClient);
  console.log("Bucket Data handler initialized");

  const realityDataClientOptions: RealityDataClientOptions = {
    authorizationClient: authorizationClient,
    baseUrl: "https://api.bentley.com/reality-management/reality-data",
  };
  const realityDataClient = new RealityDataAccessClient(realityDataClientOptions);
  console.log("Reality Data Client initialized");

  try {
    console.log("Upload images in ", iTwinId);
    const realityData = new ITwinRealityData(realityDataClient, undefined, iTwinId);
    realityData.displayName = imagesRealityDataName;
    realityData.type = "CCImageCollection";
    const createdRealityData = await realityDataClient.createRealityData("", iTwinId, realityData);
    const uploadResponse = await realityDataHandler.uploadData(createdRealityData.id, imagesPath, "", iTwinId);
    if (uploadResponse.isError()) {
      throw new Error("Failed to upload reality data : " + uploadResponse.error!.error.message);
    }
    console.log("Successfully uploaded images");

    const fipOutputContextScene = await runFillImageProperties(realityCaptureService, createdRealityData, fipJobName, iTwinId);

    const calibOutputContextScene = await runCalibration(realityCaptureService, bucketDataHandler, fipOutputContextScene, calibJobName, outputPath, iTwinId, calibOptions);

    await runReconstruction(realityCaptureService, realityDataHandler, calibOutputContextScene, reconsJobName, outputPath, iTwinId, lasOptions, tiles3dOptions);
  }
  catch (error: any) {
    console.log(error);
  }
}

runModelingExample();
