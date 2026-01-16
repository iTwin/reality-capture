# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import time
from dotenv import load_dotenv
from reality_capture.service.data_handler import BucketDataHandler
from utils import token_factory


def sleep(ms: int):
    time.sleep(ms / 1000)


def run_upload_example():
    """
    This example shows how to upload and download data from/to an iTwin bucket
    """

    # Inputs to provide. Please, adapt values
    roi_path = "D:/Datasets/ROI"
    output_path = "D:/Downloads/ROI"

    load_dotenv()
    itwin_id = os.getenv("ITWIN_ID", "")
    client_id = os.getenv("CLIENT_ID", "")
    client_secret = os.getenv("CLIENT_SECRET", "")

    client_info = token_factory.ClientInfo(client_id=client_id, env="prod", secret=client_secret)
    token_factory_service = token_factory.ServiceTokenFactory(client_info)
    bucket_data_handler = BucketDataHandler(token_factory_service)
    print("Bucket Data handler initialized")

    try:
        print(f"Upload ROI in {itwin_id} bucket")
        response = bucket_data_handler.upload_data(itwin_id, roi_path, "RealityCaptureExample/ROI")
        if response.is_error():
            print("Failed to upload bucket data : " + response.error.error.message)
            return
        print("Successfully uploaded ROI in iTwin bucket")

        print(f"Downloading ROI in {output_path}")
        response_download = bucket_data_handler.download_data(itwin_id, output_path,
                                                              "RealityCaptureExample/ROI")
        if response_download.is_error():
            print("Failed to download bucket data : " + response_download.error.error.message)
            return
        print("Successfully downloaded ROI from iTwin bucket")
    except Exception as error:
        print(error)


if __name__ == "__main__":
    run_upload_example()
