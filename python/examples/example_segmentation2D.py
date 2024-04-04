# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a Reality Analysis job detecting 3D lines and S2D
import os
import time

import reality_apis.RDAS.reality_data_analysis_service as RDAS
import reality_apis.DataTransfer.reality_data_transfer as DataTransfer

from reality_apis.DataTransfer.references import ReferenceTable
from reality_apis.RDAS.job_settings import S2DJobSettings
from reality_apis.utils import RealityDataType, JobState

from config import project_id, client_id
from token_factory.token_factory import ClientInfo, SpaDesktopMobileTokenFactory


def main():

    ccimage_collections = r"path to your image folder"
    photos_context_scene = r"path to the folder where your context scene file is"
    photo_segmentation_detector = r"path to the folder where your detector is"
    mesh = r"path to the folder where your mesh is"
    mesh_context_scene = r"path to the folder where your context scene file that references the mesh is"
    output_path = r"path to the folder where you want to save outputs"

    job_name = "3D from S2D job SDK sample"
    ccimage_collections_name = "Test 3D from S2D Photos"
    photos_scene_name = "Test 3D from S2D photos"
    mesh_name = "Test 3D from S2D mesh"
    mesh_scene_name = "Test 3D from S2D Scene"
    detector_name = "Test 3D from S2D detector"

    print("Reality Analysis sample job detecting 3D lines")

    scope_set = {
        "realitydata:modify",
        "realitydata:read",
        "realitydataanalysis:read",
        "realitydataanalysis:modify",
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

    # initializing rda service
    service_rda = RDAS.RealityDataAnalysisService(token_factory)
    print("Service initialized")

    # creating reference table and uploading ccimageCollection, oriented photos, mesh, mesh contextScene and detector if necessary (not yet on the cloud)
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
            RealityDataType.CCImageCollection,
            project_id,
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(ccimage_collections, ret.value)
        if ret.is_error():
            print("Error adding reference:", ret.error)
            exit(1)

    # upload Oriented photos (ContextScene)
    if not references.has_local_path(photos_context_scene):
        print("No reference to ContextScene found, uploading local files to cloud")
        ret = data_transfer.upload_context_scene(
            photos_context_scene,
            photos_scene_name,
            project_id,
            references,
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(photos_context_scene, ret.value)
        if ret.is_error():
            print("Error adding reference:", photos_context_scene)
            exit(1)

    # upload detector
    if not references.has_local_path(photo_segmentation_detector):
        print("No reference to detector found, uploading local files to cloud")
        ret = data_transfer.upload_reality_data(
            photo_segmentation_detector,
            detector_name,
            RealityDataType.ContextDetector,
            project_id,
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(photo_segmentation_detector, ret.value)
        if ret.is_error():
            print("Error adding reference:", ret.error)
            exit(1)

    # upload meshes
    if not references.has_local_path(mesh):
        print("No reference to mesh found, uploading local files to cloud")
        ret = data_transfer.upload_reality_data(
            mesh, mesh_name, RealityDataType.CCImageCollection, project_id
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(mesh, ret.value)
        if ret.is_error():
            print("Error adding reference:", ret.error)
            exit(1)

    # upload Mesh ContextScene
    if not references.has_local_path(mesh_context_scene):
        print("No reference to mesh ContextScene found, uploading local files to cloud")
        ret = data_transfer.upload_context_scene(
            mesh_context_scene, mesh_scene_name, project_id, references
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(mesh_context_scene, ret.value)
        if ret.is_error():
            print("Error adding reference:", mesh_context_scene)
            exit(1)

    # saving references (so we don't need to re-upload afterwards)
    ret = references.save(references_path)
    if ret.is_error():
        print("Error saving references:", ret.error)
        exit(1)
    print("Checked data upload")

    # creating job settings
    settings = S2DJobSettings()
    settings.inputs.photos = references.get_cloud_id_from_local_path(
        photos_context_scene
    ).value
    settings.inputs.photo_segmentation_detector = (
        references.get_cloud_id_from_local_path(photo_segmentation_detector).value
    )
    settings.inputs.meshes = references.get_cloud_id_from_local_path(
        mesh_context_scene
    ).value

    settings.outputs.lines3D = "lines3D"
    settings.outputs.segmentation2D = "segmentation2D"
    print("Settings created")

    # creating and submitting job
    ret = service_rda.create_job(settings, job_name, project_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Created Job")
    job_id = ret.value
    ret = service_rda.submit_job(job_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Submitted Job")

    # tracking job progress
    while True:
        progress_ret = service_rda.get_job_progress(job_id)
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
    ret = service_rda.get_job_properties(job_id)
    if ret.is_error():
        print("Error while getting settings:", ret.error)
        exit(1)
    final_settings = ret.value.job_settings
    print("Downloading outputs")

    lines3D_id = final_settings.outputs.lines3D
    ret = data_transfer.download_context_scene(lines3D_id, output_path, project_id, references)
    if ret.is_error():
        print("Error while downloading output:", ret.error)
        exit(1)
    print("Successfully downloaded output")


if __name__ == "__main__":
    main()
