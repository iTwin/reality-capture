# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample uploading, downloading and deleting an Image Collection

import time

import rd_api_wrapper as rd
from config import project_id, rd_api_server, ims_server, client_id
from token_factory.token_factory import ServiceTokenFactory


def main():
    # you should change these variables to reflect the image collection you want to use
    # output_dir is the folder where files will be saved in your computer from the service
    ###############################
    # ccimage_collections = r"C:\RDAS_Demo_Set\Image_Object-Face_License_Plates\images"
    # name = "My Image Collection"
    # rd_type = "CCImageCollection"
    # output_dir = r"C:\output"
    ##############################

    # necessary scopes for the services we will use
    scope_list = ["realitydata:modify", "realitydata:read", "offline_access"]

    print("Reality Data API sample")

    # creating token
    token_factory = ServiceTokenFactory(client_id, ims_server, scope_list)

    # creating client for the service
    client = rd.RealityDataClient(token_factory, rd_api_server)

    # creating a new reality data object
    rd_create = rd.RealityDataCreate(name, rd.Classification.UNDEFINED,
                                     rd_type, description="Some Image collection")
    print(f"Creating a new reality data {rd_create.name()} for project {project_id}...")
    code, reality_data = client.create_reality_data(rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        exit(1)
    print(f"Created reality data {reality_data.name()} [{reality_data.id()}]")

    # uploading images
    print("Uploading files...")
    lap = time.perf_counter()
    code = client.upload_files(reality_data.id(), project_id, ccimage_collections)
    if not code.success():
        print("Failed to upload reality data:", code)
        exit(1)
    print(f"Files were successfully uploaded in {round(time.perf_counter() - lap, 1)}s")

    # downloading images
    print("Downloading files...")
    lap = time.perf_counter()
    code = client.download_files(reality_data.id(), project_id, output_dir)
    if not code.success():
        print("Failed to download reality data:", code)
        exit(1)
    print(f"Files were successfully downloaded in {round(time.perf_counter() - lap, 1)}s")

    # deleting images from the service
    print(f"Deleting reality data {reality_data.id()}")
    code = client.delete_reality_data(reality_data.id())
    if not code.success():
        print("Failed to delete reality data:", code)
        exit(1)
    print("Reality data deleted")

    exit(0)


if __name__ == "__main__":
    main()
