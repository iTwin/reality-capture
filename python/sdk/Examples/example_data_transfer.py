# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample uploading and downloading a reality data

import sdk.DataTransfer.reality_data_transfer as DataTransfer
from token_factory.token_factory import ClientInfo, SpaDesktopMobileTokenFactory

from sdk.utils import RealityDataType
from config import project_id, client_id


def main():

    ccimage_collections = r"C:\DataTransfer_Demo\images"
    output_path = r"C:\tests\DataTransfer"
    ccimage_collections_name = "Test Data Transfer"

    print("Data Transfer example: upload and download of files")

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
    print("Data transfer initialized")

    # upload ccimageCollection
    ret_up = data_transfer.upload_reality_data(
        ccimage_collections,
        ccimage_collections_name,
        RealityDataType.ImageCollection,
        project_id,
    )
    if ret_up.is_error():
        print("Error in upload:", ret_up.error)
        exit(1)
    print("Upload finished")

    # download ccimageCollection
    ret_down = data_transfer.download_reality_data(ret_up.value, output_path)
    if ret_down.is_error():
        print(
            "Error while downloading output with id {}: {}".format(
                ret_up.value, ret_down.error
            )
        )
        exit(1)
    print("Successfully downloaded output")


if __name__ == "__main__":
    main()
