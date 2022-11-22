# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a Reality Data Analysis job detecting 2D objects
import os
import time

import sdk.RDAS.reality_data_analysis_service as RDAS
import sdk.DataTransfer.reality_data_transfer as DataTransfer

from sdk.DataTransfer.references import ReferenceTable
from sdk.RDAS.job_settings import O2DJobSettings
from sdk.utils import RealityDataType, JobState

from token_factory.token_factory import ClientInfo
from token_factory.token_factory import SpaDesktopMobileTokenFactory
# from config import project_id


def main():
    # Get environment variables
    project_id = os.getenv('IMJS_PROJECT_ID')
    client_id = os.getenv('IMJS_CLIENT_ID')
    secret = os.getenv('IMJS_SECRET')

    print("project_id is:", project_id)
    print("client_id is:", client_id)
#     ccimage_collections = (
#         r"Q:\Analyze\DataSets\RDAS_Demo_Set\Photo_Object-Face_and_License_Plates\images"
#     )
#     photo_context_scene = (
#         r"Q:\Analyze\DataSets\RDAS_Demo_Set\Photo_Object-Face_and_License_Plates"
#     )
#     photo_object_detector = r"C:\Users\Ariana.Carnielli\Downloads\Face_&_License_plates"
#     output_path = r"D:\test_sdk\new_sdk\test"
#
#     job_name = "O2D job new SDK sample"
#     ccimage_collections_name = "Test Moto Photos"
#     context_scene_name = "Test Moto Scene"
#     detector_name = "O2D photos in RAS-QA"
#
#     client_id = "native-GAlXfUfBkUM26BDsEhdd3ZomI"
#
#     print("Reality Data Analysis sample job detecting 2D objects")
#
#     # will put this inside a enum or class I think
#     scope_set = {
#         "realitydata:modify",
#         "realitydata:read",
#         "realitydataanalysis:read",
#         "realitydataanalysis:modify",
#     }
#     scope_set.add("offline_access")
#
#     client_info_qa = ClientInfo(client_id, scope_set, "qa")
#     token_factory_qa = SpaDesktopMobileTokenFactory(client_info_qa)
#
#     client_info_dev = ClientInfo(client_id, scope_set, "dev")
#     token_factory_dev = SpaDesktopMobileTokenFactory(client_info_dev)
#
#     # initializing data transfer
#     data_transfer = DataTransfer.RealityDataTransfer(token_factory_qa)
#     # adding hook to follow upload and download status
#     data_transfer.set_progress_hook(DataTransfer.example_hook)
#     print("Data transfer initialized")
#
#     # initializing rda service
#     service_rda = RDAS.RealityDataAnalysisService(token_factory_dev)
#     print("Service initialized")
#
#     # creating reference table and uploading ccimageCollection, contextScene and detector if necessary (not yet on the cloud)
#     references = ReferenceTable()
#     references_path = os.path.join(output_path, "test_references_python.txt")
#     if os.path.isfile(references_path):
#         print("Loading preexistent references")
#         ret = references.load(references_path)
#         if ret.is_error():
#             print("Error while loading preexisting references:", ret.error)
#             exit(1)
#
#     # ccimageCollection
#     if not references.has_local_path(ccimage_collections):
#         print(
#             "No reference to CCimage Collections found, uploading local files to cloud"
#         )
#         ret = data_transfer.upload_reality_data(
#             ccimage_collections,
#             ccimage_collections_name,
#             RealityDataType.ImageCollection,
#             project_id,
#         )
#         if ret.is_error():
#             print("Error in upload:", ret.error)
#             exit(1)
#         ret = references.add_reference(ccimage_collections, ret.value)
#         if ret.is_error():
#             print("Error adding reference:", ret.error)
#             exit(1)
#
#     # contextScene
#     if not references.has_local_path(photo_context_scene):
#         print("No reference to ContextScene found, uploading local files to cloud")
#         ret = data_transfer.upload_context_scene(
#             photo_context_scene, context_scene_name, project_id, references
#         )
#         if ret.is_error():
#             print("Error in upload:", ret.error)
#             exit(1)
#         ret = references.add_reference(photo_context_scene, ret.value)
#         if ret.is_error():
#             print("Error adding reference:", photo_context_scene)
#             exit(1)
#
#     # detector
#     if not references.has_local_path(photo_object_detector):
#         print("No reference to detector found, uploading local files to cloud")
#         ret = data_transfer.upload_reality_data(
#             photo_object_detector,
#             detector_name,
#             RealityDataType.ContextDetector,
#             project_id,
#         )
#         if ret.is_error():
#             print("Error in upload:", ret.error)
#             exit(1)
#         ret = references.add_reference(photo_object_detector, ret.value)
#         if ret.is_error():
#             print("Error adding reference:", ret.error)
#             exit(1)
#
#     # saving references (so we don't need to re-upload afterwards)
#     ret = references.save(references_path)
#     if ret.is_error():
#         print("Error saving references:", ret.error)
#         exit(1)
#     print("Checked data upload")
#
#     # creating job settings
#     settings = O2DJobSettings()
#     settings.inputs.photos = references.get_cloud_id_from_local_path(
#         photo_context_scene
#     ).value
#     settings.inputs.photo_object_detector = references.get_cloud_id_from_local_path(
#         photo_object_detector
#     ).value
#     settings.outputs.objects2D = "true"
#     print("Settings created")
#
#     # creating and submitting job
#     ret = service_rda.create_job(settings, job_name, project_id)
#     if ret.is_error():
#         print("Error in submit:", ret.error)
#         exit(1)
#     print("Created Job")
#     job_id = ret.value
#     ret = service_rda.submit_job(job_id)
#     if ret.is_error():
#         print("Error in submit:", ret.error)
#         exit(1)
#     print("Submitted Job")
#
#     # tracking job progress
#     while True:
#         progress_ret = service_rda.get_job_progress(job_id)
#         if progress_ret.is_error():
#             print("Error while getting progress:", progress_ret.error)
#             exit(1)
#         job_progress = progress_ret.value
#         if (
#             job_progress.state == JobState.SUCCESS
#             or job_progress.state == JobState.Completed
#             or job_progress.state == JobState.Over
#         ):
#             break
#         elif (
#             job_progress.state == JobState.ACTIVE
#             or job_progress.state == JobState.Running
#         ):
#             print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
#         elif job_progress.state == JobState.CANCELLED:
#             print("Job cancelled")
#             exit(0)
#         elif job_progress.state == JobState.FAILED:
#             print("Job Failed")
#             print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
#             exit(1)
#         time.sleep(60)
#     print("Job done")
#
#     # retrieving results
#     print("Retrieving outputs ids")
#     ret = service_rda.get_job_properties(job_id)
#     if ret.is_error():
#         print("Error while getting settings:", ret.error)
#         exit(1)
#     final_settings = ret.value.job_settings
#     print("Downloading outputs")
#
#     objects2D_id = final_settings.outputs.objects2D
#     ret = data_transfer.download_context_scene(objects2D_id, output_path, references)
#     if ret.is_error():
#         print("Error while downloading output:", ret.error)
#         exit(1)
#     print("Successfully downloaded output")
#
#


if __name__ == "__main__":
    main()
