# Sample uploading, downloading and deleting an Image Collection

import time

import rd_api_sdk
from token_factory.token_factory import TokenFactory

from examples.config import *

class RealityDataTokens(TokenFactory):
    def __init__(self, auth_point, token_point, redirect_url, client_id):
        super().__init__(auth_point, token_point, redirect_url, client_id)

    def get_read_token(self):
        return self.get_token(["realitydata:modify", "realitydata:read", "offline_access"])

    def get_modify_token(self):
        return self.get_token(["realitydata:modify", "realitydata:read", "offline_access"])


def main():
    print("Reality Data API sample")

    project_id = "ad14b27c-91ea-4492-9433-1e2d6903b5e4"
    images_to_upload = "Q:\Analyze\RAS\Motos"
    where_to_download = "F:\RDAS\out\Motos"

    token_factory = RealityDataTokens("https://"+ims_server+"/connect/authorize",
                                      "https://"+ims_server+"/connect/token",
                                      "http://localhost:8080/sign-oidc",
                                      client_id
                                      )
    client = rd_api_sdk.RealityDataClient(token_factory, rd_api_server)

    rd_create = rd_api_sdk.RealityDataCreate("My Image Collection", rd_api_sdk.Classification.UNDEFINED,
                                             "CCImageCollection", description="Some Image collection")
    print(f"Creating a new reality data {rd_create.name()} for project {project_id}...")
    code, reality_data = client.create_reality_data(rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        exit(1)
    print(f"Created reality data {reality_data.name()} [{reality_data.id()}]")

    print("Uploading files...")
    lap = time.clock()
    code = client.upload_files(reality_data.id(), project_id, images_to_upload)
    if not code.success():
        print("Failed to upload reality data:", code)
        exit(1)
    print(f"Files were successfully uploaded in {round(time.clock() - lap,1)}s")

    print("Downloading files...")
    lap = time.clock()
    code = client.download_files(reality_data.id(), project_id, where_to_download)
    if not code.success():
        print("Failed to download reality data:", code)
        exit(1)
    print(f"Files were successfully downloaded in {round(time.clock() - lap,1)}s")

    print(f"Deleting reality data {reality_data.id()}")
    code = client.delete_reality_data(reality_data.id())
    if not code.success():
        print("Failed to delete reality data:", code)
        exit(1)
    print("Reality data deleted")

    exit(0)


if __name__ == "__main__":
    main()
