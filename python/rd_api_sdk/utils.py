# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import shutil
import tempfile
import xml.etree.ElementTree as ET
from typing import Optional, Dict

from rd_api_sdk.rd_client import RealityDataClient
from rd_api_sdk.reality_data import RealityData, RealityDataCreate, Classification


def replace_references(context_scene_path: str, reference_table: Dict[str, str], in_place: bool = False) -> (bool, str):
    """
    Replace Path references in ContextScene
    Used to translated references from/to local folders to/from their corresponding Reality Data ID
    If in_place is false (default), the created ContextScene is named "ContextScene.xml" in a tmp dir
    Else the created ContextScene replaces the existent one

    :param context_scene_path: Path of the ContextScene to update
    :param reference_table: Map folder paths from/to reality data id for every entry in the ContextScene
    :param in_place: If false the created ContextScene is named "ContextScene.xml" in a tmp dir else replaces the existent one
    :return: Boolean to indicate success, path to the scene with replacement
    """
    try:
        root = ET.parse(context_scene_path).getroot()
    except Exception as e:
        print("Failed to parse xml:", e)
        return False, ""

    references = root.find("References")
    if references is not None:
        for reference_node in references.findall("Reference"):
            reference_path_node = reference_node.find("Path")
            if reference_path_node is None:
                print("Invalid reference format")
                return False, ""

            path_normalized = reference_path_node.text
            if reference_path_node.text[:4] != "rds:":
                path_normalized = os.path.normpath(path_normalized)
            if path_normalized not in reference_table:
                print("Missing translation for reference", path_normalized)
                return False, ""
            reference_path_node.text = reference_table[path_normalized]

    new_scene_path = os.path.join(tempfile.mkdtemp(), "ContextScene.xml")

    # Save the ContextScene with reality data references
    try:
        with open(new_scene_path, 'wb') as f:
            f.write(ET.tostring(root))
    except Exception as e:
        print(f"Cannot create {new_scene_path}")
        return False, ""
    if in_place:
        try:
            shutil.copyfile(new_scene_path, context_scene_path)
        except Exception as e:
            print(f"Cannot overwrite {context_scene_path}")
            return False, ""
        try:
            shutil.rmtree(os.path.dirname(new_scene_path))
        except Exception as e:
            print(f"Cannot delete {new_scene_path}")
            return False, ""
        new_scene_path = context_scene_path
    print("References successfully replaced")
    return True, new_scene_path


def replace_local_paths(ccorientation_path: str, reference_table: Dict[str, str], in_place: bool = False) -> (bool, str):
    """
    Replace ImagePath local paths in CCorientations
    Used to translated paths from/to local folders to/from their corresponding Reality Data ID
    If in_place is false (default), the created CCorientations is named "Orientations.xml" in a tmp dir
    Else the created CCorientations replaces the existent one

    :param ccorientation_path: Path of the CCorientations to update
    :param reference_table: Map folder paths from/to reality data id for every entry in the CCorientations
    :param in_place: If false the created CCorientations is named "Orientations.xml" in a tmp dir else replaces the existent one
    :return: Boolean to indicate success, path to the orientations with replacement
    """
    try:
        root = ET.parse(ccorientation_path).getroot()
    except Exception as e:
        print("Failed to parse xml:", e)
        return False, ""

    for imagePath_node in root.findall(".//ImagePath"):
        image_dir = os.path.dirname(imagePath_node.text)
        if image_dir not in reference_table:
            return False, ""
        imagePath_node.text = reference_table[image_dir]

    new_orientation_path = os.path.join(tempfile.mkdtemp(), "Orientations.xml")

    # Save the CCOrientations with reality data references
    try:
        with open(new_orientation_path, 'wb') as f:
            f.write(ET.tostring(root))
    except Exception as e:
        print(f"Cannot create {new_orientation_path}")
        return False, ""
    if in_place:
        try:
            shutil.copyfile(new_orientation_path, ccorientation_path)
        except Exception as e:
            print(f"Cannot overwrite {ccorientation_path}")
            return False, ""
        try:
            shutil.rmtree(os.path.dirname(new_orientation_path))
        except Exception as e:
            print(f"Cannot delete {new_orientation_path}")
            return False, ""
        new_orientation_path = ccorientation_path
    print("References successfully replaced")
    return True, new_orientation_path


def upload_image_collection(rd_client: RealityDataClient, project_id: str, image_collection_path: str,
                            image_collection_name: str) -> Optional[RealityData]:
    """
    Upload an image collection

    :param rd_client: Reality Data Client
    :param project_id: Project id
    :param image_collection_path: Path to image collection to be uploaded
    :param image_collection_name: Name for this image collection
    :return: RealityData if successful (None otherwise)
    """
    rd_create = RealityDataCreate(image_collection_name, Classification.IMAGERY, "CCImageCollection",
                                  description="Image collection")
    print(f"Creating a new reality data {rd_create.name()} for project {project_id}...")
    code, reality_data = rd_client.create_reality_data(rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        return None
    print(f"Created reality data {reality_data.name()} [{reality_data.id()}]")

    print("Uploading files...")
    code = rd_client.upload_files(reality_data.id(), project_id, image_collection_path)
    if not code.success():
        print("Failed to upload data:", code)
        return None
    print("Image collection was successfully uploaded")

    return reality_data


def upload_context_scene(rd_client: RealityDataClient, project_id: str, context_scene_path: str,
                         context_scene_name: str,
                         reference_table: Dict[str, str]) -> Optional[RealityData]:
    """
    Upload a ContextScene

    :param rd_client: Reality Data Client
    :param project_id: Project id
    :param context_scene_path: Path to ContextScene to be uploaded
    :param context_scene_name: Name for this ContextScene
    :param reference_table: Map from folder paths to reality data id for every entry in the scene
    :return: RealityData if successful (None otherwise)
    """

    # First replace references in ContextScene to their corresponding reality data id, and save this new scene to a temporary location
    print("Replacing references...")
    success, rds_context_scene_path = replace_references(context_scene_path, reference_table)
    if not success:
        print("Could not replace references. Aborting upload")
        return None

    rd_create = RealityDataCreate(context_scene_name, Classification.UNDEFINED, "ContextScene",
                                  description="ContextScene")
    print(f"Creating a new reality data {rd_create.name()} for project {project_id}...")
    code, reality_data = rd_client.create_reality_data(rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        return None
    print(f"Created reality data {reality_data.name()} [{reality_data.id()}]")

    print("Uploading ContextScene...")
    # Upload the scene
    code = rd_client.upload_files(reality_data.id(), project_id, os.path.dirname(rds_context_scene_path))
    if not code.success():
        print("Failed to upload data:", code)
        return None
    # Upload all files in scene directory, except the scene before the replacement of references
    code = rd_client.upload_files(reality_data.id(), project_id, os.path.dirname(context_scene_path),
                                  ignore_files=[context_scene_path])
    if not code.success():
        print("Failed to upload data:", code)
        return None

    shutil.rmtree(os.path.dirname(rds_context_scene_path))

    print("ContextScene was successfully uploaded")

    return reality_data


def upload_detector(rd_client: RealityDataClient, project_id: str, detector_path: str, detector_name: str) -> Optional[
    RealityData]:
    """
    Upload a detector

    :param rd_client: Reality Data Client
    :param project_id: Project id
    :param detector_path: Path to detector to be uploaded
    :param detector_name: Name for this Detector
    :return: RealityData if successful (None otherwise)
    """

    rd_create = RealityDataCreate(detector_name, Classification.UNDEFINED, "ContextDetector", description="Detector")
    print(f"Creating a new reality data {rd_create.name()} for project {project_id}...")
    code, reality_data = rd_client.create_reality_data(rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        return None
    print(f"Created reality data {reality_data.name()} [{reality_data.id()}]")

    print("Uploading Detector...")
    code = rd_client.upload_files(reality_data.id(), project_id, detector_path)
    if not code.success():
        print("Failed to upload data:", code)
        return None
    print("Detector was successfully uploaded")

    return reality_data


def download_reality_data_and_replace_references(rd_client: RealityDataClient, rd_id: str, project_id: str,
                                                 destination_folder: str, reference_table: Dict[str, str] = None):
    """
    Download reality data and if there's a ContextScene at destination then update it using the reference table.
    :param rd_client: Reality Data Client
    :param rd_id: Reality Data id
    :param project_id: Project id
    :param destination_folder: Path to the destination folder
    :param reference_table: Map from reality data id to folder path for every entry in the scene
    :return: Boolean to indicate success
    """

    if not os.path.exists(destination_folder):
        os.makedirs(destination_folder, exist_ok=True)
    if not os.path.isdir(destination_folder):
        print("Failed to create directory:", destination_folder)
        return False
    code = rd_client.download_files(rd_id, project_id, destination_folder)
    if not code.success():
        print("Failed to download reality data:", code)
        return False
    # Check if ContextScene and replace rds references
    context_scene_path = os.path.join(destination_folder, "ContextScene.xml")
    if os.path.exists(context_scene_path):
        print("Replacing references...")
        success, _ = replace_references(context_scene_path, reference_table, in_place=True)
        if not success:
            print("Failed to replace references")
            return False
    return True


def upload_context_scene_and_dependencies(rd_client: RealityDataClient, project_id: str, context_scene_path: str,
                                          image_collections):
    """
    Upload image collections and store their reality data id in a reference table, then update and upload the ContextScene
    using the reference tables created.
    :param rd_client: Reality Data Client
    :param project_id: Project id
    :param context_scene_path: Path to ContextScene to be uploaded
    :param image_collections: list of paths to image collections to be uploaded
    :return: RealityData if successful (None otherwise), maps from folder paths to reality data id for every entry in the
    scene and vice-versa
    """
    local_to_rds_table = dict()
    rds_to_local_table = dict()

    for image_collection in image_collections:
        reality_data = upload_image_collection(rd_client=rd_client,
                                               project_id=project_id,
                                               image_collection_path=image_collection,
                                               image_collection_name=os.path.basename(image_collection))
        if reality_data is None:
            print("Could not upload", image_collection)
            return None, None, None
        # Reality Data ids in scenes should be prefixed with "rds:"
        local_to_rds_table[os.path.normpath(image_collection)] = "rds:" + reality_data.id()
        rds_to_local_table["rds:" + reality_data.id()] = os.path.normpath(image_collection)
    print("All image collections were successfully uploaded")

    # Upload ContextScene using reference table
    context_scene_reality_data = upload_context_scene(rd_client=rd_client,
                                                      project_id=project_id,
                                                      context_scene_path=context_scene_path,
                                                      context_scene_name=os.path.basename(
                                                          os.path.dirname(context_scene_path)),
                                                      reference_table=local_to_rds_table)
    if context_scene_reality_data is None:
        print("Could not upload", context_scene_path)
        return None, None, None

    return context_scene_reality_data, local_to_rds_table, rds_to_local_table


def upload_ccorientations_and_dependencies(rd_client: RealityDataClient, project_id: str, ccorientations_path: str,
                                          image_collections):
    """
    Upload image collections and store their reality data id in a reference table, then update and upload the CCOrientations
    using the reference tables created.
    :param rd_client: Reality Data Client
    :param project_id: Project id
    :param ccorientations_path: Path to CCOrientations to be uploaded
    :param image_collections: list of paths to image collections to be uploaded
    :return: RealityData if successful (None otherwise), maps from folder paths to reality data id for every entry in the
    ccorientations and vice-versa
    """
    local_to_rds_table = dict()
    rds_to_local_table = dict()

    for image_collection in image_collections:
        reality_data = upload_image_collection(rd_client=rd_client,
                                               project_id=project_id,
                                               image_collection_path=image_collection,
                                               image_collection_name=os.path.basename(image_collection))
        if reality_data is None:
            print("Could not upload", image_collection)
            return None, None, None
        # Reality Data ids in ccorientations should be prefixed with "rds:"
        local_to_rds_table[os.path.normpath(image_collection)] = "rds:" + reality_data.id()
        rds_to_local_table["rds:" + reality_data.id()] = os.path.normpath(image_collection)
    print("All image collections were successfully uploaded")

    # Upload CCorientations using reference table
    ccorientation_reality_data = upload_ccorientation(rd_client=rd_client,
                                                      project_id=project_id,
                                                      ccorientation_path=ccorientations_path,
                                                      ccorientation_name=os.path.basename(
                                                          os.path.dirname(ccorientations_path)),
                                                      reference_table=local_to_rds_table)
    if ccorientation_reality_data is None:
        print("Could not upload", ccorientations_path)
        return None, None, None

    return ccorientation_reality_data, local_to_rds_table, rds_to_local_table


def upload_ccorientation(rd_client: RealityDataClient, project_id: str, ccorientation_path: str,
                         ccorientation_name: str,
                         reference_table: Dict[str, str]) -> Optional[RealityData]:
    """
    Upload a CCOrientations

    :param rd_client: Reality Data Client
    :param project_id: Project id
    :param ccorientation_path: Path to CCorientations to be uploaded
    :param ccorientation_name: Name for this CCOrientation
    :param reference_table: Map from folder paths to reality data id for every entry in the ccorientation
    :return: RealityData if successful (None otherwise)
    """

    # First local paths in CCorientation to their corresponding reality data id, and save this new ccorientation to a temporary location
    print("Replacing local paths...")
    success, rds_ccorientation_path = replace_local_paths(ccorientation_path, reference_table)
    if not success:
        print("Could not replace local paths. Aborting upload")
        return None

    rd_create = RealityDataCreate(ccorientation_name, Classification.UNDEFINED, "CCorientations",
                                  description="CCorientations")
    print(f"Creating a new reality data {rd_create.name()} for project {project_id}...")
    code, reality_data = rd_client.create_reality_data(rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        return None
    print(f"Created reality data {reality_data.name()} [{reality_data.id()}]")

    print("Uploading CCorientations...")
    # Upload the ccorientation
    code = rd_client.upload_files(reality_data.id(), project_id, os.path.dirname(rds_ccorientation_path))
    if not code.success():
        print("Failed to upload data:", code)
        return None
    # Upload all files in ccorientation directory, except the ccorientations before the replacement of references
    code = rd_client.upload_files(reality_data.id(), project_id, os.path.dirname(ccorientation_path),
                                  ignore_files=[ccorientation_path])
    if not code.success():
        print("Failed to upload data:", code)
        return None

    shutil.rmtree(os.path.dirname(rds_ccorientation_path))

    print("CCOrientations was successfully uploaded")

    return reality_data