# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample downloading a context scene and all the reality data referenced in it.
# Download reality data in sub folders names "ref0", "ref1"...

import reality_apis.DataTransfer.reality_data_transfer as DataTransfer
from token_factory.token_factory import ClientInfo, SpaDesktopMobileTokenFactory

from reality_apis.utils import RealityDataType
from config import project_id, client_id
import json
import os
import xml.etree.ElementTree as Et


def main():
    #context_scene_cloud_id = r"Context scene identifier in Context Share"
    #context_scene_file_name = r"Context scene file name (include extension)"
    #output_path = r"path to the folder where you want to save downloaded files"

    context_scene_cloud_id = r"a1fa1346-8d9d-4b74-acdc-d1c69f3e98b5"
    context_scene_file_name = r"ContextScene.xml"
    output_path = r"D:\output"

    scope_set = {
        "realitydata:modify",
        "realitydata:read",
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

    # download context scene
    print("Downloading context scene...")
    ret_down = data_transfer.download_context_scene(context_scene_cloud_id, output_path, project_id)
    if ret_down.is_error():
        print(
            "Error while downloading output with id {}: {}".format(
                context_scene_cloud_id, ret_down.error
            )
        )
        exit(1)
    print("Successfully downloaded context scene")

    print("Parse context scene and download reality data...")
    context_scene_local_path = os.path.join(output_path, context_scene_file_name)
    ref_index = 0
    with open(context_scene_local_path, "r", encoding="utf-8") as file:
        if context_scene_local_path.endswith('.xml'):
            # xml
            tree = Et.ElementTree()
            tree.parse(file)
            root = tree.getroot()
            if root.tag != "ContextScene":
                print("Invalid ContextScene")
                exit(1)
            refs = root.find("References")
            if refs is not None:
                for reference in refs.findall("Reference"):
                    ref_path = reference.find("Path")
                    if ref_path is None:
                        print("Error while parsing the context scene : Path not found in reference")
                        exit(1)
                    ref_path_cloud_id = ref_path.text[4:]
                    ref_output_path = os.path.join(output_path, "ref" + str(ref_index))
                    # download reality data
                    print("Downloading reality data ", ref_path_cloud_id, "...")
                    ret_down = data_transfer.download_reality_data(ref_path_cloud_id, ref_output_path, project_id)
                    if ret_down.is_error():
                        print(
                            "Error while downloading output with id {}: {}".format(
                                ref_path_cloud_id, ret_down.error
                            )
                        )
                        exit(1)
                    print("Successfully downloaded reality data")
                    ref_index += 1

        elif context_scene_local_path.endswith('.json'):
            # json
            data = json.load(file)
            refs = data.get("References", None)
            if refs is not None:
                for ref_nb in refs.values():
                    ref_path = ref_nb.get("Path", None)
                    if ref_path is None:
                        print("Error while parsing the context scene : Path not found in reference")
                        exit(1)
                    ref_path_cloud_id = ref_path[4:]
                    ref_output_path = os.path.join(output_path, "ref" + str(ref_index))
                    # download reality data
                    print("Downloading reality data ", ref_path_cloud_id, "...")
                    ret_down = data_transfer.download_reality_data(ref_path_cloud_id, ref_output_path, project_id)
                    if ret_down.is_error():
                        print(
                            "Error while downloading output with id {}: {}".format(
                                ref_path_cloud_id, ret_down.error
                            )
                        )
                        exit(1)
                    print("Successfully downloaded reality data")
                    ref_index += 1
        else:
            print("Unsupported file extension")
            exit(1)
        print("Successfully downloaded all reality data from context scene")


if __name__ == "__main__":
    main()
