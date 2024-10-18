import os
import time
import xml.etree.ElementTree as Et
import tempfile

import reality_apis.CCS.context_capture_service as CCS
import reality_apis.DataTransfer.reality_data_transfer as DataTransfer
import reality_apis.iTwins.itwins as iTwins

from reality_apis.CCS.ccs_utils import CCJobSettings, CCJobQuality, CCJobType
from reality_apis.utils import RealityDataType, JobState

from token_factory.token_factory import ClientInfo, ServiceTokenFactory

def authenticate(client_id, client_secret):
    print("Authentication...")
    # Scopes needed to upload/download data and run Modeling jobs
    scope_set = {
        "itwin-platform", # should not be modified
    }
    client_info = ClientInfo(client_id, scope_set)
    client_info.secret = client_secret
    # Use a service iTwin application. It will not open a popup during the authentication (used for pipelines and automated tasks), but it will be the owner of the created iTwin.
    # You will not be able to access the iTwin, unless you add your mail as a member of the iTwin.
    token_factory = ServiceTokenFactory(client_info)
    # Initializing Data Transfer, iTwins and Modeling services
    iTwin_sdk = iTwins.iTwinsApiWrapper(token_factory)
    data_transfer = DataTransfer.RealityDataTransfer(token_factory)
    # adding hook to follow upload and download status
    data_transfer.set_progress_hook(DataTransfer.example_hook)
    service_cc = CCS.ContextCaptureService(token_factory)
    print("Authentication Done.")
    return iTwin_sdk, data_transfer, service_cc

def create_at_input_from_photos(images_path, images_cloud_id, at_input_path):
    # Create a simplified orientations file. See https://developer.bentley.com/apis/contextcapture/cc-ori/
    root = Et.Element("BlocksExchange")
    block = Et.SubElement(root, "Block")
    Et.SubElement(block, "Name").text = "Block_1"
    bulk = Et.SubElement(block, "BulkPhotos")
    image_id = 0
    for image in os.listdir(images_path):
        if image.split(".")[-1] == "jpg" or image.split(".")[-1] == "JPG":
            photo = Et.SubElement(bulk, "Photo")
            Et.SubElement(photo, "Id").text = str(image_id)
            image_cloud_path = os.path.join(images_cloud_id, image).replace("\\", "/")
            Et.SubElement(photo, "ImagePath").text = image_cloud_path
            image_id += 1
    Et.SubElement(block, "ControlPoints")
    Et.SubElement(block, "PositioningConstraints")

    tree = Et.ElementTree(root)
    Et.indent(tree, space="\t", level=0)
    tree.write(os.path.join(at_input_path, "Orientations.xml"), xml_declaration=True, encoding="utf-8")

def create_iTwin(iTwin_sdk, iTwin_display_name, iTwin_data_center_location, iTwin_class = iTwins.iTwinClass.ENDEAVOR, iTwin_subclass = iTwins.iTwinSubClass.PROJECT, iTwin_type = "",
                 iTwin_number = "", iTwin_geographic_location = "", iTwin_iana_time_zone = "",
                 iTwin_status = iTwins.iTwinStatus.ACTIVE, iTwin_parent_id = ""):
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
    print("iTwin created successfully : " + iTwin_id)
    return iTwin_id

def upload_data(data_transfer, photos_path, iTwin_id):
    # Upload images
    print("Uploading local photos")
    ret_upload_photos = data_transfer.upload_reality_data(photos_path, "Photos CCImageCollection", RealityDataType.CCImageCollection, iTwin_id)
    if ret_upload_photos.is_error():
        print("Error in photos upload:", ret_upload_photos.error)
        exit(1)
    print("Photos upload done")

    # Create AT input from photos
    print("Creating AT input file")
    # Save the file in a temporary folder
    temp_dir = tempfile.TemporaryDirectory()
    temp_dir_path = temp_dir.name
    create_at_input_from_photos(photos_path, ret_upload_photos.value, temp_dir_path)
    at_input = fr"{temp_dir_path}"
    print("AT input file created successfully, saved in : ", temp_dir_path)

    # Upload AT input file
    ret_upload_at_input = data_transfer.upload_ccorientation(at_input, "AT Input", iTwin_id)
    if ret_upload_at_input.is_error():
        print("Error in upload:", ret_upload_at_input.error)
        exit(1)

    print("AT input upload done")
    return ret_upload_photos.value, ret_upload_at_input.value

def create_workspace(service_cc, iTwin_id):
    ret = service_cc.create_workspace("Example workspace name", iTwin_id)
    if ret.is_error():
        print("Error creating workspace:", ret.error)
        exit(1)
    print("Workspace created")
    return ret.value

def create_and_submit_at(service_cc, workspace_id, photos_cloud_id, at_input_id):
    # Create settings for AT job
    at_settings = CCJobSettings()
    at_settings.inputs = [
        photos_cloud_id,
        at_input_id,
    ]
    at_settings.mesh_quality = CCJobQuality.EXTRA
    # Will produce calibrated photos
    at_settings.outputs.ccorientation = "CCorientations"  # a non empty string will make the job generate the output
    print("AT Settings created")

    # Creating and submitting AT job
    ret_create_at = service_cc.create_job(CCJobType.CALIBRATION, at_settings, "AT job name", workspace_id)
    if ret_create_at.is_error():
        print("Error in AT job creation :", ret_create_at.error)
        exit(1)
    print("Created AT Job")
    at_job_id = ret_create_at.value
    ret_submit_at = service_cc.submit_job(at_job_id)
    if ret_submit_at.is_error():
        print("Error in submit AT :", ret_submit_at.error)
        exit(1)
    print("AT submitted")
    return at_job_id

def get_at_output_id(service_cc, at_job_id):
    cloud_settings_ret = service_cc.get_job_properties(at_job_id)
    cloud_settings = cloud_settings_ret.value.job_settings
    at_output_id = cloud_settings.outputs.ccorientation
    return at_output_id

def get_cesium_tiles_id(service_cc, recons_job_id):
    cloud_settings_ret = service_cc.get_job_properties(recons_job_id)
    cloud_settings = cloud_settings_ret.value.job_settings
    cesium_id = cloud_settings.outputs.cesium_3D_tiles
    return cesium_id

def create_and_submit_reconstruction(service_cc, workspace_id, photos_cloud_id, at_output_id):
    # Create settings for Reconstruction job, it needs the photos and the AT output.
    recons_settings = CCJobSettings()
    recons_settings.inputs = [
        photos_cloud_id,
        at_output_id,
    ]
    recons_settings.mesh_quality = CCJobQuality.EXTRA
    recons_settings.outputs.cesium_3D_tiles = "cesium3dTiles"
    print("Reconstruction Settings created")

    # Creating and submitting Reconstruction job
    ret = service_cc.create_job(CCJobType.RECONSTRUCTION, recons_settings, "Reconstruction job name", workspace_id)
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
    return recons_job_id

def download_at_output(data_transfer, at_output_id, output_path, iTwin_id):
    print("Downloading AT output...")
    at_output_path = os.path.join(output_path, "AT_Output")
    if not (os.path.exists(at_output_path) and os.path.isdir(at_output_path)):
        os.makedirs(at_output_path)
    ret_down = data_transfer.download_ccorientation(at_output_id, at_output_path, iTwin_id)
    if ret_down.is_error():
        print(
            "Error while downloading AT output with id {}: {}".format(
                at_output_id, ret_down.error
            )
        )
        exit(1)
    print("Successfully downloaded AT output")

def download_cesium_tiles(data_transfer, cesium_id, output_path, iTwin_id):
    print("Downloading cesium tiles...")
    cesium_output_path = os.path.join(output_path, "Cesium_Output")
    if not (os.path.exists(cesium_output_path) and os.path.isdir(cesium_output_path)):
        os.makedirs(cesium_output_path)
    ret_down = data_transfer.download_reality_data(cesium_id, cesium_output_path, iTwin_id)
    if ret_down.is_error():
        print(
            "Error while downloading cesium tiles with id {}: {}".format(
                cesium_id, ret_down.error
            )
        )
        exit(1)
    print("Successfully downloaded cesium tiles")

def monitor_job(service_cc, job_id):
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

def main():
    # ---------User inputs----------

    # Authentication
    client_id = "your client id" # iTwin service app id, see https://developer.bentley.com/my-apps/
    client_secret = "your client secret"

    # iTwin
    iTwin_display_name = "The name of your iTwin"
    iTwin_data_center_location = "Australia East" # The data center where the data for this iTwin will be persisted

    # Input and output data
    photos_path = r"your_photos" # Path where your photos are located
    output_path = r"your_output_path" # Where the output data will be downloaded

    # ------------------------------

    # 1) Authentication
    iTwin_sdk, data_transfer, service_cc = authenticate(client_id, client_secret)

    # 2) Create an iTwin
    iTwin_id = create_iTwin(iTwin_sdk, iTwin_display_name, iTwin_data_center_location)

    # 3) Upload data to run Modeling jobs on cloud
    photos_cloud_id, at_output_id = upload_data(data_transfer, photos_path, iTwin_id)

    # 4) Submit AT job, to get calibrated photos
    # Create job workspace, it will contain temporary files
    workspace_id = create_workspace(service_cc, iTwin_id)
    at_job_id = create_and_submit_at(service_cc, workspace_id, photos_cloud_id, at_output_id)

    # 5) Monitor AT job
    monitor_job(service_cc, at_job_id)
    print("AT Job completed")

    # 6) Submit reconstruction job (to generate cesium tiles)
    # To submit the reconstruction job, we need to get the AT output cloud id
    at_output_id = get_at_output_id(service_cc, at_job_id)
    recons_job_id = create_and_submit_reconstruction(service_cc, workspace_id, photos_cloud_id, at_output_id)

    # 7) Monitor Reconstruction
    monitor_job(service_cc, recons_job_id)
    print("Reconstruction Job completed")

    # 8) Download AT output
    download_at_output(data_transfer, at_output_id, output_path, iTwin_id)

    # 9) Download Reconstruction output (cesium tiles)
    cesium_id = get_cesium_tiles_id(service_cc, recons_job_id)
    download_cesium_tiles(data_transfer, cesium_id, output_path, iTwin_id)

if __name__ == "__main__":
    main()