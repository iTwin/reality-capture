# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import time
from dotenv import load_dotenv
from reality_capture.service.data_handler import BucketDataHandler, RealityDataHandler
from reality_capture.service.job import Progress, JobState, JobCreate, JobType, _get_appropriate_service
from reality_capture.service.service import RealityCaptureService, RealityDataCreate
from reality_capture.specifications.calibration import CalibrationInputs, CalibrationOutputsCreate, \
    CalibrationSpecificationsCreate, CalibrationOptions, AdjustmentConstraints
from reality_capture.specifications.fill_image_properties import FillImagePropertiesInputs, \
    FillImagePropertiesOutputsCreate, FillImagePropertiesOptions, FillImagePropertiesSpecificationsCreate
from reality_capture.specifications.production import ExportCreate, OptionsLAS, SamplingStrategy, Options3DTiles, \
    LODScope, Format
from reality_capture.specifications.reconstruction import ReconstructionInputs, ReconstructionOutputsCreate, \
    ReconstructionSpecificationsCreate
from reality_capture.specifications.tiling import TilingOptions, GeometricPrecision
from utils import token_factory
from reality_capture.service.reality_data import Type


def sleep(ms: int):
    time.sleep(ms / 1000)


def monitor_job(reality_capture_service: RealityCaptureService, job_id: str):
    # Monitor job progress every 10s
    progress = Progress(state=JobState.QUEUED, percentage=0)
    while progress.state not in (JobState.CANCELLED, JobState.FAILED, JobState.SUCCESS):
        response = reality_capture_service.get_job_progress(job_id, _get_appropriate_service(JobType.RECONSTRUCTION))
        if response.is_error():
            print("Can't get job progress")
        progress = response.value
        print("Progress :", progress.percentage)
        sleep(10000)
        if progress.state == JobState.CANCELLED or progress.state == JobState.FAILED:
            print("Job not completed")
        elif progress.state == JobState.SUCCESS:
            print("Job completed")


def run_fill_image_properties(reality_capture_service, images_reality_data, fip_job_name, itwin_id):
    # Submit FillImageProperties job to get a context scene from the images
    fip_inputs = FillImagePropertiesInputs(imageCollections=[images_reality_data])
    fip_outputs = [FillImagePropertiesOutputsCreate.SCENE]
    fip_options = FillImagePropertiesOptions()
    fip_specs = FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs, options=fip_options)
    fip_job_to_submit = JobCreate(name=fip_job_name, specifications=fip_specs,
                                  type=JobType.FILL_IMAGE_PROPERTIES, iTwinId=itwin_id)
    submit_fip_response = reality_capture_service.submit_job(fip_job_to_submit)
    if submit_fip_response.is_error():
        raise Exception("Failed to submit FillImageProperties job : " + submit_fip_response.error.error.message)
    fip_job_id = submit_fip_response.value.id
    print("FillImageProperties job submitted")
    monitor_job(reality_capture_service, fip_job_id)
    fip_properties_response = reality_capture_service.get_job(fip_job_id, _get_appropriate_service(JobType.FILL_IMAGE_PROPERTIES))
    if fip_properties_response.is_error():
        raise Exception("Failed to retrieve FillImageProperties job properties : " + fip_properties_response.error.error.message)
    return fip_properties_response.value.specifications.outputs.scene


def run_calibration(reality_capture_service, bucket_data_handler, fip_output_context_scene, calib_job_name, output_path, itwin_id, calib_options):
    # Submit Calibration job to get an oriented context scene
    calib_inputs = CalibrationInputs(scene=fip_output_context_scene)
    calib_outputs = [CalibrationOutputsCreate.SCENE, CalibrationOutputsCreate.REPORT]
    calib_specs = CalibrationSpecificationsCreate(inputs=calib_inputs, outputs=calib_outputs, options=calib_options)
    calib_job_to_submit = JobCreate(name=calib_job_name, specifications=calib_specs,
                                    type=JobType.CALIBRATION, iTwinId=itwin_id)
    submit_calib_response = reality_capture_service.submit_job(calib_job_to_submit)
    if submit_calib_response.is_error():
        raise Exception("Failed to submit Calibration job : " + submit_calib_response.error.error.message)
    calib_job_id = submit_calib_response.value.id
    print("Calibration job submitted")
    monitor_job(reality_capture_service, calib_job_id)
    calib_properties_response = reality_capture_service.get_job(calib_job_id, _get_appropriate_service(JobType.CALIBRATION))
    if calib_properties_response.is_error():
        raise Exception("Failed to retrieve Calibration job properties : " + calib_properties_response.error.error.message)
    outputs = calib_properties_response.value.specifications.outputs
    chars = outputs.report.split(":")  # Remove 'bkt:' from the report bucket path
    calib_download_response = bucket_data_handler.download_data(itwin_id, os.path.join(output_path, "Report"), chars[1])
    if calib_download_response.is_error():
        raise Exception("Failed to download report " + calib_download_response.error.error.message)
    return outputs.scene


def run_reconstruction(reality_capture_service, reality_data_handler, calib_output_context_scene, recons_job_name, output_path, itwin_id, las_options, tiles3d_options):
    # Submit Reconstruction job to generate the LAS
    recons_inputs = ReconstructionInputs(scene=calib_output_context_scene)
    export_las = ExportCreate(format=Format.LAS, options=las_options)
    export_3dtiles = ExportCreate(format=Format.THREED_TILES, options=tiles3d_options)
    recons_outputs = ReconstructionOutputsCreate(exports=[export_las, export_3dtiles])
    tiling_options = TilingOptions(geometricPrecision=GeometricPrecision.EXTRA)
    recons_specs = ReconstructionSpecificationsCreate(inputs=recons_inputs, outputs=recons_outputs, options=tiling_options)
    recons_job_to_submit = JobCreate(name=recons_job_name, specifications=recons_specs, type=JobType.RECONSTRUCTION, iTwinId=itwin_id)
    submit_recons_response = reality_capture_service.submit_job(recons_job_to_submit)
    if submit_recons_response.is_error():
        raise Exception("Failed to submit Reconstruction job : " + submit_recons_response.error.error.message)
    recons_job_id = submit_recons_response.value.id
    print("Reconstruction job submitted")
    monitor_job(reality_capture_service, recons_job_id)
    print("Downloading Reconstruction LAS output")
    recons_properties_response = reality_capture_service.get_job(recons_job_id, _get_appropriate_service(JobType.RECONSTRUCTION))
    if recons_properties_response.is_error():
        raise Exception("Failed to retrieve Reconstruction job properties : " + recons_properties_response.error.error.message)
    outputs = recons_properties_response.value.specifications.outputs
    for recons_export in outputs.exports:
        recons_download_response = reality_data_handler.download_data(recons_export.location, os.path.join(output_path, recons_export.format.value), "", itwin_id)
        if recons_download_response.is_error():
            raise Exception("Failed to download export {}: {}".format(recons_export.format, recons_download_response.error.error.message))
    print("Successfully downloaded Reconstruction LAS output")


def run_modeling_example():
    """
    This example shows how to submit a Reconstruction job and get a LAS from images
    """
    # Inputs to provide. Please, adapt values
    images_path = "D:/Datasets/Helico/Images"
    output_path = "D:/Datasets/Helico/Results"

    # Options for calibration
    calib_options = CalibrationOptions(
        adjustmentConstraints=[AdjustmentConstraints.POSITION_METADATA]  # Adjustment from photos position metadata
    )

    # Options for Reconstruction LAS export
    las_options = OptionsLAS(
        samplingDistance=0.5,
        samplingStrategy=SamplingStrategy.ABSOLUTE,
        crs="EPSG:32631"
    )
    # Options for Reconstruction 3DTiles export
    tiles3d_options = Options3DTiles(
        lodScope=LODScope.ACROSS_TILES
    )

    # Optional names
    images_reality_data_name = "Reality Capture SDK sample images"
    fip_job_name = "Reality Capture SDK FillImageProperties job example"
    calib_job_name = "Reality Capture SDK Calibration job example"
    recons_job_name = "Reality Capture SDK Reconstruction job example"

    # Environment variables for credentials
    # Load environment variables
    load_dotenv()
    itwin_id = os.getenv("ITWIN_ID", "")
    client_id = os.getenv("CLIENT_ID", "")
    client_secret = os.getenv("CLIENT_SECRET", "")

    client_info = token_factory.ClientInfo(client_id=client_id, env="prod", secret=client_secret)
    token_factory_service = token_factory.ServiceTokenFactory(client_info)
    print("Reality Data handler initialized")

    reality_capture_service = RealityCaptureService(token_factory_service)
    print("Reality Capture service initialized")

    reality_data_handler = RealityDataHandler(token_factory_service)
    print("Reality Data handler initialized")

    bucket_data_handler = BucketDataHandler(token_factory_service)
    print("Bucket Data handler initialized")

    try:
        print("Upload images in", itwin_id)
        reality_data_create = RealityDataCreate(iTwinId=itwin_id, type=Type.CC_IMAGE_COLLECTION,
                                                displayName=images_reality_data_name)
        ret = reality_capture_service.create_reality_data(reality_data_create)
        if ret.is_error():
            print(f"Can't create reality data {images_reality_data_name} in iTwin {itwin_id}")
            return
        reality_data_id = ret.value.id
        response = reality_data_handler.upload_data(reality_data_id, images_path, "", itwin_id)
        if response.is_error():
            print("Failed to upload reality data:", response.error.error.message)
            return
        print("Successfully uploaded images")

        fip_output_context_scene = run_fill_image_properties(reality_capture_service, reality_data_id, fip_job_name, itwin_id)
        calib_output_context_scene = run_calibration(reality_capture_service, bucket_data_handler, fip_output_context_scene, calib_job_name, output_path, itwin_id, calib_options)
        run_reconstruction(reality_capture_service, reality_data_handler, calib_output_context_scene, recons_job_name, output_path, itwin_id, las_options, tiles3d_options)
    except Exception as error:
        print(error)


if __name__ == "__main__":
    run_modeling_example()
