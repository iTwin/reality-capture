# Sample creating and submitting a Reality Modeling job
import os
import time

import reality_apis.CCS.context_capture_service as CCS
import reality_apis.DataTransfer.reality_data_transfer as DataTransfer
import reality_apis.iTwins.itwins as iTwins

from reality_apis.DataTransfer.references import ReferenceTable
from reality_apis.CCS.ccs_utils import CCJobSettings, CCJobQuality, CCJobType
from reality_apis.utils import RealityDataType, JobState

from token_factory.token_factory import ClientInfo, ServiceTokenFactory, SpaDesktopMobileTokenFactory


def main():
    # ---------User inputs----------

    # Authentication & iTwin app
    client_id = "your client id"
    client_secret = "your client secret"
    scope_set = {
        "itwin-platform",  # should not be modified
    }
    client_info = ClientInfo(client_id, scope_set)  # should not be modified
    client_info.secret = client_secret  # should not be modified
    # Use a service iTwin application. It will not open a popup during the authentication (used for pipelines and automated tasks), but it will be the owner of the created iTwin.
    # You will not be able to access the iTwin, unless you add your mail as a member of the iTwin.
    token_factory = ServiceTokenFactory(client_info)
    # Otherwise, you can create a Desktop/Mobile itwin application, it will open a popup during the authentication, but you will be the owner of the created iTwin
    # token_factory = SpaDesktopMobileTokenFactory(client_info)

    # iTwin
    # a) Use an existing iTwin
    iTwin_id = "your iTwin/project id"
    # b) If you don't have an iTwin, assign an empty string to iTwin_id variable, and provide these parameters :
    # Once the iTwin is created, please, assign the id to iTwin_id variable
    # Required :
    iTwin_class = iTwins.iTwinClass.ENDEAVOR
    iTwin_subclass = iTwins.iTwinSubClass.PROJECT
    iTwin_display_name = "The name of your iTwin"
    # Not required :
    iTwin_type = ""
    iTwin_number = ""
    iTwin_geographic_location = ""
    iTwin_iana_time_zone = ""
    iTwin_data_center_location = ""
    iTwin_status = iTwins.iTwinStatus.ACTIVE
    iTwin_parent_id = ""

    # Data
    ccimage_collections = r"your image collection (folder)"
    ccorientations = r"your ccorientations (folder with an Orientations.xml file inside)"
    output_path = r"path where the outputs will be generated"

    # Other
    at_job_name = "AT job"
    reconstruction_job_name = "Reconstruction job"
    workspace_name = "Reality Modeling SDK test workspace"
    ccimage_collections_name = "Test Photos"
    ccorientations_name = "Test ccorientations"

    # ------------------------------

    # 1) Authentication
    # Scopes needed to upload/download data and run Modeling jobs
    print("Authentication...")
    # initializing Data Transfer, iTwins and Modeling services
    iTwin_sdk = iTwins.iTwinsApiWrapper(token_factory)
    data_transfer = DataTransfer.RealityDataTransfer(token_factory)
    service_cc = CCS.ContextCaptureService(token_factory)
    print("Services initialized")

    # 2) Create an iTwin (if iTwin_id is not provided)
    if iTwin_id == "":
        print("Creating an iTwin...")
        iTwins_settings = iTwins.iTwinSettings()
        iTwins_settings.iTwin_class = iTwin_class
        iTwins_settings.iTwin_subclass = iTwin_subclass
        iTwins_settings.display_name = iTwin_display_name
        iTwins_settings.type = iTwin_type
        iTwins_settings.number = iTwin_number
        iTwins_settings.geographic_location = iTwin_geographic_location
        iTwins_settings.iana_time_zone = iTwin_iana_time_zone
        iTwins_settings.data_center_location = iTwin_data_center_location
        iTwins_settings.status = iTwin_status
        iTwins_settings.parent_id = iTwin_parent_id
        ret = iTwin_sdk.create_iTwin(iTwins_settings)
        if ret.is_error():
            print("Error while creating iTwin:", ret.error)
            exit(1)
        iTwin_id = ret.value
        print("Created iTwin : " + iTwin_id)
    else:
        print("No need to create an iTwin, currently using ", iTwin_id)

    # 3) Upload images
    # adding hook to follow upload and download status
    data_transfer.set_progress_hook(DataTransfer.example_hook)
    # creating reference table. It will save a file in output_path to avoid to upload images each time we run the script
    references = ReferenceTable()
    references_path = os.path.join(output_path, "test_references_python.txt")
    if os.path.isfile(references_path):
        print("Loading preexistent references")
        ret = references.load(references_path)
        if ret.is_error():
            print("Error while loading preexisting references:", ret.error)
            exit(1)

    # upload images
    if not references.has_local_path(ccimage_collections):
        print(
            "No reference to CCimage Collections found, uploading local files to cloud"
        )
        ret = data_transfer.upload_reality_data(
            ccimage_collections,
            ccimage_collections_name,
            RealityDataType.CCImageCollection,
            iTwin_id,
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(ccimage_collections, ret.value)
        if ret.is_error():
            print("Error adding reference:", ret.error)
            exit(1)
        print("Upload done")

    # upload ccorientations
    if not references.has_local_path(ccorientations):
        print("No reference to cc orientations found, uploading local files to cloud")
        ret = data_transfer.upload_ccorientation(
            ccorientations, ccorientations_name, iTwin_id, references
        )
        if ret.is_error():
            print("Error in upload:", ret.error)
            exit(1)
        ret = references.add_reference(ccorientations, ret.value)
        if ret.is_error():
            print("Error adding reference:", ccorientations)
            exit(1)

    # saving references (so we don't need to re-upload next time)
    ret = references.save(references_path)
    if ret.is_error():
        print("Error saving references:", ret.error)
        exit(1)
    print("Checked data upload")

    # 4) Perform AT
    # create workspace, it will contain temporary files
    ret = service_cc.create_workspace(workspace_name, iTwin_id)
    if ret.is_error():
        print("Error creating workspace:", ret.error)
        exit(1)
    workspace_id = ret.value
    print("Workspace created")

    # create settings for Calibration job (AT)
    at_settings = CCJobSettings()
    at_settings.inputs = [
        references.get_cloud_id_from_local_path(ccimage_collections).value,
        references.get_cloud_id_from_local_path(ccorientations).value,
    ]
    at_settings.mesh_quality = CCJobQuality.EXTRA
    # It produces calibrated photos
    at_settings.outputs.ccorientation = "ccorientations" # a non empty string will make the job generate the output
    print("AT Settings created")

    # creating and submitting Calibration (AT) job
    ret = service_cc.create_job(CCJobType.CALIBRATION, at_settings, at_job_name, workspace_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Created AT Job")
    at_job_id = ret.value
    ret = service_cc.submit_job(at_job_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Submitted AT Job")

    # 5) Monitor AT
    while True:
        progress_ret = service_cc.get_job_progress(at_job_id)
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
            print("AT Job cancelled")
            exit(0)
        elif job_progress.state == JobState.FAILED:
            print("AT Job Failed")
            print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
            exit(1)
        time.sleep(60)
    print("AT Job done")

    # 6) Submit reconstruction job (to generate cesium tiles)
    # We need to get the cloud id of the calibrated ccorientation produced in the AT to submit this job
    cloud_settings_ret = service_cc.get_job_properties(at_job_id)
    cloud_settings = cloud_settings_ret.value.job_settings
    ccorientation_id = cloud_settings.outputs.ccorientation

    # create settings for Reconstruction job, it needs the images and the ccorientation.
    recons_settings = CCJobSettings()
    recons_settings.inputs = [
        references.get_cloud_id_from_local_path(ccimage_collections).value,
        ccorientation_id,
    ]
    recons_settings.mesh_quality = CCJobQuality.EXTRA
    # It produces cesium tiles
    recons_settings.outputs.cesium_3D_tiles = "cesium3dTiles"
    print("Reconstruction Settings created")

    # creating and submitting Reconstruction job
    ret = service_cc.create_job(CCJobType.RECONSTRUCTION, recons_settings, reconstruction_job_name, workspace_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Created Job")
    recons_job_id = ret.value
    ret = service_cc.submit_job(recons_job_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Submitted Reconstruction Job")

    # 7) Monitor Reconstruction
    while True:
        progress_ret = service_cc.get_job_progress(recons_job_id)
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
            print("Reconstruction Job cancelled")
            exit(0)
        elif job_progress.state == JobState.FAILED:
            print("Reconstruction Job Failed")
            print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
            exit(1)
        time.sleep(60)
    print("Reconstruction Job done")

    # 8) Download calibrated ccorientations
    print("Downloading ccorientations...")
    ret_down = data_transfer.download_ccorientation(ccorientation_id, output_path, iTwin_id, references)
    if ret_down.is_error():
        print(
            "Error while downloading ccorientations with id {}: {}".format(
                ccorientation_id, ret_down.error
            )
        )
        exit(1)
    print("Successfully downloaded ccorientations")

    # 8) Download cesium tiles
    print("Downloading cesium tiles...")
    cloud_settings_ret = service_cc.get_job_properties(recons_job_id)
    cloud_settings = cloud_settings_ret.value.job_settings
    cesium_id = cloud_settings.outputs.cesium_3D_tiles

    ret_down = data_transfer.download_reality_data(cesium_id, output_path, iTwin_id)
    if ret_down.is_error():
        print(
            "Error while downloading cesium tiles with id {}: {}".format(
                cesium_id, ret_down.error
            )
        )
        exit(1)
    print("Successfully downloaded cesium tiles")

if __name__ == "__main__":
    main()