# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import time
from dotenv import load_dotenv
from reality_capture.service.data_handler import RealityDataHandler
from reality_capture.service.service import RealityCaptureService, RealityDataCreate
from reality_capture.service.reality_data import Type
from utils import token_factory


def sleep(ms: int):
    time.sleep(ms / 1000)


def run_upload_example():
    """
    This example shows how to upload and download data from/to an iTwin using the Reality Capture SDK in Python.
    """

    # Inputs to provide. Please, adapt values
    images_path = "D:/Datasets/Helico/Images"
    output_path = "D:/Downloads/Helico/Images"
    images_name = "Reality Capture SDK context scene example"

    # Load environment variables
    load_dotenv()

    itwin_id = os.getenv("ITWIN_ID", "")
    client_id = os.getenv("CLIENT_ID", "")
    client_secret = os.getenv("CLIENT_SECRET", "")

    client_info = token_factory.ClientInfo(client_id=client_id, env="prod", secret=client_secret)
    token_factory_service = token_factory.ServiceTokenFactory(client_info)
    reality_data_handler = RealityDataHandler(token_factory_service)
    reality_capture_service_data = RealityCaptureService(token_factory_service)
    print("Reality Data handler initialized")

    try:
        print("Upload images in", itwin_id)
        reality_data_create = RealityDataCreate(iTwinId=itwin_id, type=Type.CC_IMAGE_COLLECTION,
                                                displayName=images_name)
        ret = reality_capture_service_data.create_reality_data(reality_data_create)
        if ret.is_error():
            print(f"Can't create reality data {images_name} in iTwin {itwin_id}")
            return
        reality_data_id = ret.value.id
        response = reality_data_handler.upload_data(reality_data_id, images_path, "", itwin_id)
        if response.is_error():
            print("Failed to upload reality data:", response.error.error.message)
            return
        print("Successfully uploaded images")

        print("Downloading images in", output_path)
        response_download = reality_data_handler.download_data(reality_data_id, output_path, "", itwin_id)
        if response_download.is_error():
            print("Failed to download reality data:", response_download.error.error.message)
            return
        print("Successfully downloaded images")
    except Exception as error:
        print(error)


if __name__ == "__main__":
    run_upload_example()
