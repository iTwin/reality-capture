# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import json
import os
import xml.etree.ElementTree as Et
from reality_apis.DataTransfer.references import ReferenceTable
from reality_apis.utils import ReturnValue


def _replace_context_scene_references_xml(
    scene_path: str,
    new_scene_path: str,
    reference_table: ReferenceTable,
    local_to_cloud: bool,
) -> ReturnValue[bool]:
    """
        Replaces references on the given ContextScene by the ones on the reference table.
        This function can either replace local paths for reality data IDs or the contrary, according to the value of
        local_to_cloud.

    Args:
        scene_path: Path to the ContextScene. It must be an .xml file
        new_scene_path: Path to the new ContextScene. You can pass the same path twice if you want to replace the file.
        reference_table: A table mapping local path of dependencies to their ID.
        local_to_cloud: If true, searches for local paths and replaces them for reality data ids, if false does the
            opposite.

    Returns:
        True if function was successful, and a potential error message.
    """
    tree = Et.ElementTree()
    with open(scene_path, "r", encoding="utf-8") as file:
        tree.parse(file)
        root = tree.getroot()
        if root.tag != "ContextScene":
            return ReturnValue(
                value=False, error=f"{scene_path} is not a valid ContextScene"
            )
        refs = root.find("References")
        if refs is not None:
            for reference in refs.findall("Reference"):
                ref_path = reference.find("Path")
                if ref_path is None:
                    return ReturnValue(
                        value=False,
                        error=f"Invalid Reference format in scene {scene_path}",
                    )
                if local_to_cloud:
                    ret = reference_table.get_cloud_id_from_local_path(ref_path.text)
                    new_path = "rds:" + ret.value
                else:
                    ret = reference_table.get_local_path_from_cloud_id(ref_path.text[4:])
                    new_path = ret.value
                if ret.is_error():
                    return ReturnValue(value=False, error=ret.error)
                ref_path.text = new_path

    tree.write(new_scene_path, encoding="utf-8")
    return ReturnValue(value=True, error="")


def _replace_context_scene_references_json(
    scene_path: str,
    new_scene_path: str,
    reference_table: ReferenceTable,
    local_to_cloud: bool,
) -> ReturnValue[bool]:
    """
        Replaces references on the given ContextScene by the ones on the reference table.
        This function can either replace local paths for reality data IDs or the contrary, according to the value of
        local_to_cloud.

    Args:
        scene_path: Path to the ContextScene. It must be a .json file.
        new_scene_path: Path to the new ContextScene. You can pass the same path twice if you want to replace the file.
        reference_table: A table mapping local path of dependencies to their ID.
        local_to_cloud: If true, searches for local paths and replaces them for reality data ids, if false does the
            opposite.

    Returns:
        True if function was successful, and a potential error message.
    """
    if scene_path == new_scene_path:
        new_scene = scene_path
    else:
        new_scene = new_scene_path
    with open(scene_path, "r", encoding="utf-8") as file:
        data = json.load(file)
        refs = data.get("References", None)
        if refs is not None:
            for ref_nb in refs.values():
                old_path = ref_nb.get("Path", None)
                if old_path is None:
                    return ReturnValue(
                        value=False, error=f"Invalid Reference format in scene {scene_path}"
                    )
                if local_to_cloud:
                    ret = reference_table.get_cloud_id_from_local_path(
                        os.path.normpath(old_path)
                    )
                    new_path = "rds:" + ret.value
                else:
                    ret = reference_table.get_local_path_from_cloud_id(old_path[4:])
                    new_path = ret.value
                if ret.is_error():
                    return ReturnValue(value=False, error=ret.error)
                ref_nb["Path"] = new_path

    with open(new_scene, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)
    return ReturnValue(value=True, error="")


def replace_context_scene_references(
    scene_path: str,
    new_scene_path: str,
    reference_table: ReferenceTable,
    local_to_cloud: bool,
) -> ReturnValue[bool]:
    """
        Replaces references on the given ContextScene by the ones on the reference table.
        This function can either replace local paths for reality data IDs or the contrary, according to the value of
        local_to_cloud.

    Args:
        scene_path: Path to the ContextScene.
        new_scene_path: Path to the new ContextScene. You can pass the same path twice if you want to replace the file.
        reference_table: A table mapping local path of dependencies to their ID.
        local_to_cloud: If true, searches for local paths and replaces them for reality data ids, if false does the
            opposite.

    Returns:
        True if function was successful, and a potential error message.
    """
    _, extension = os.path.splitext(scene_path)
    if extension == ".xml":
        return _replace_context_scene_references_xml(
            scene_path, new_scene_path, reference_table, local_to_cloud
        )
    return _replace_context_scene_references_json(
        scene_path, new_scene_path, reference_table, local_to_cloud
    )


def replace_ccorientation_references(
    ccorientation_path: str,
    new_ccorientation_path: str,
    reference_table: ReferenceTable,
    local_to_cloud: bool,
) -> ReturnValue[bool]:
    """
        Replaces references on the given CCOrientation by the ones on the reference table.
        This function can either replace local paths for reality data IDs or the contrary, according to the value of
        local_to_cloud.

    Args:
        ccorientation_path: Path to the CCOrientation.
        new_ccorientation_path: Path to the new CCOrientation. You can pass the same path twice if you want to replace
            the file.
        reference_table: A table mapping local path of dependencies to their ID.
        local_to_cloud: If true, searches for local paths and replaces them for reality data ids, if false does the
            opposite.

    Returns:
        True if function was successful, and a potential error message.
    """
    tree = Et.ElementTree()
    with open(ccorientation_path, "r", encoding="utf-8") as file:
        tree.parse(file)
        root = tree.getroot()
        if root.tag != "BlocksExchange":
            exit(1)
        for image_tag in tree.findall(".//ImagePath"):
            old_path, filename = os.path.split(image_tag.text)
            if local_to_cloud:
                ret = reference_table.get_cloud_id_from_local_path(old_path)
            else:
                ret = reference_table.get_local_path_from_cloud_id(old_path)
            if ret.is_error():
                return ReturnValue(value=False, error=ret.error)
            new_path = ret.value
            image_tag.text = os.path.join(new_path, filename)
        for image_tag in tree.findall(".//MaskPath"):
            old_path, filename = os.path.split(image_tag.text)
            if local_to_cloud:
                ret = reference_table.get_cloud_id_from_local_path(old_path)
            else:
                ret = reference_table.get_local_path_from_cloud_id(old_path)
            if ret.is_error():
                return ReturnValue(value=False, error=ret.error)
            new_path = ret.value
            image_tag.text = os.path.join(new_path, filename)

    tree.write(new_ccorientation_path, encoding="utf-8", xml_declaration=True)
    return ReturnValue(value=True, error="")
