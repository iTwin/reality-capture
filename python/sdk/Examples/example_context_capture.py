# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a ContextCapture job
import os
import time

import sdk.CCS.context_capture_service as CCS
import sdk.DataTransfer.reality_data_transfer as DataTransfer

from sdk.DataTransfer.references import ReferenceTable
from sdk.CCS.ccs_utils import CCJobSettings, CCJobQuality, CCJobType
from sdk.utils import RealityDataType, JobState

from config import project_id, client_id
from token_factory.token_factory import ClientInfo, SpaDesktopMobileTokenFactory


def main():

    ccimage_collections = r"C:\CCS_Demo_Set\S2D-3CS-Bridge\BridgeImages"
    cc_orientations = r"C:\CCS_Demo_Set\S2D-3CS-Bridge\BridgeCCorientation"
    output_path = r"C:\tests\CCS"

    job_name = "CCCS job SDK sample"
    workspace_name = "CCCS SDK test workspace"
    ccimage_collections_name = "Test CCCS Photos"
    cc_orientations_name = "Test CCCS cc orientations"

    print("Context Capture sample job - Full (Calibration + Reconstruction)")

    scope_set = {
        "realitydata:modify",
        "realitydata:read",
        "contextcapture:modify",
        "contextcapture:read",
    }
    # only for desktop/mobile applications
    scope_set.add("offline_access")

    client_info = ClientInfo(client_id, scope_set)
    token_factory = SpaDesktopMobileTokenFactory(client_info)

    # initializing data transfer
    data_transfer = DataTransfer.RealityDataTransfer(token_factory)
    # adding hook to follow upload and download status
    data_transfer.set_progress_hook(DataTransfer.example_hook)
    print("Data transfer initialized")

    # initializing cc service
    service_cc = CCS.ContextCaptureService(token_factory)
    print("Service initialized")

    # creating reference table and uploading ccimageCollection, ccOrientations if necessary (not yet on the cloud)
    references = ReferenceTable()
    references_path = os.path.join(output_path, "test_references_python.txt")
    if os.path.isfile(references_path):
        print("Loading preexistent references")
        ret = references.load(references_path)
        if ret.is_error():
            print("Error while loading preexisting references:", ret.error)
            exit(1)

    # upload ccimageCollection
    if not references.has_local_path(ccimage_collections):
        print(
            "No reference to CCimage Collections found, uploading local files to cloud"
        )
        ret = data_transfer.upload_reality_data(
            ccimage_collections,
            ccimage_collections_name,
            RealityDataType.ImageCollection,
            project_id,
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(ccimage_collections, ret.value)
        if ret.is_error():
            print("Error adding reference:", ret.error)
            exit(1)

    # upload ccorientations
    if not references.has_local_path(cc_orientations):
        print("No reference to cc orientations found, uploading local files to cloud")
        ret = data_transfer.upload_ccorientation(
            cc_orientations, cc_orientations_name, project_id, references
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(cc_orientations, ret.value)
        if ret.is_error():
            print("Error adding reference:", cc_orientations)
            exit(1)

    # saving references (so we don't need to re-upload afterwards)
    ret = references.save(references_path)
    if ret.is_error():
        print("Error saving references:", ret.error)
        exit(1)
    print("Checked data upload")

    # create workspace
    ret = service_cc.create_workspace(workspace_name, project_id)
    if ret.is_error():
        print("Error creating workspace:", ret.error)
        exit(1)
    workspace_id = ret.value

    # create job settings
    settings = CCJobSettings()
    settings.inputs = [
        references.get_cloud_id_from_local_path(ccimage_collections).value,
        references.get_cloud_id_from_local_path(cc_orientations).value,
    ]
    settings.outputs.threeMX = "threeMX"
    settings.mesh_quality = CCJobQuality.MEDIUM
    print("Settings created")

    # creating and submitting job
    ret = service_cc.create_job(CCJobType.FULL, settings, job_name, workspace_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Created Job")
    job_id = ret.value
    ret = service_cc.submit_job(job_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Submitted Job")

    # tracking job progress
    while True:
        progress_ret = service_cc.get_job_progress(job_id)
        if progress_ret.is_error():
            print("Error while getting progress:", progress_ret.error)
            exit(1)
        job_progress = progress_ret.value
        if (
            job_progress.state == JobState.SUCCESS
            or job_progress.state == JobState.Completed
            or job_progress.state == JobState.Over
        ):
            break
        elif (
            job_progress.state == JobState.ACTIVE
            or job_progress.state == JobState.Running
        ):
            print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
        elif job_progress.state == JobState.CANCELLED:
            print("Job cancelled")
            exit(0)
        elif job_progress.state == JobState.FAILED:
            print("Job Failed")
            print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
            exit(1)
        time.sleep(60)
    print("Job done")

    # retrieving results
    print("Retrieving outputs ids")
    ret = service_cc.get_job_properties(job_id)
    if ret.is_error():
        print("Error while getting properties:", ret.error)
        exit(1)
    final_settings = ret.value.job_settings
    print("Downloading outputs")

    threeMX_id = final_settings.outputs.threeMX
    ret = data_transfer.download_reality_data(threeMX_id, output_path, project_id)
    if ret.is_error():
        print("Error while downloading output:", ret.error)
        exit(1)
    print("Successfully downloaded output")


if __name__ == "__main__":
    main()
