# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a Reality Data Analysis job detecting 2D objects

import rd_api_wrapper as rd
import rda_api_wrapper as rda
from config import project_id, rda_api_server, rd_api_server, ims_server, client_id
from token_factory.token_factory import ServiceTokenFactory


def main():

    # you should change these variables to reflect the images collections, contextScene and detector you want to use
    # output_dir is the folder where the result of the analysis will be saved in your computer
    ###############################
    # ccimage_collections = ["C:\RDAS_Demo_Set\Image_Object-Face_License_Plates\images"]
    # photos = r"C:\RDAS_Demo_Set\Image_Object-Face_License_Plates\ContextScene.xml"
    # photo_object_detector = r"C:\Face_&_License_plates_1"
    # output_dir = r"C:\output\O2D"
    # number_of_photos = 10
    # giga_pixels = 20
    # job_name = "O2D job sample"
    # detector_name = "O2D photo in RAS-QA"
    ###############################

    # necessary scopes for the services we will use
    scope_list = ["realitydata:modify", "realitydata:read", "realitydataanalysis:read", "realitydataanalysis:modify", "offline_access"]

    print("Reality Data Analysis sample job detecting 2D objects")

    # creating token
    token_factory = ServiceTokenFactory(client_id, ims_server, scope_list)

    # creating clients for each service we will use
    rd_client = rd.RealityDataClient(token_factory, rd_api_server)
    rda_client = rda.RealityDataAnalysClient(token_factory, rda_api_server)

    # uploading scene using rds
    context_scene_reality_data, local_to_rds_table, rds_to_local_table = rd.upload_context_scene_and_dependencies(
        rd_client, project_id, photos, ccimage_collections)
    if context_scene_reality_data is None:
        exit(1)

    # uploading detector using rds
    detector_reality_data = rd.upload_detector(rd_client, project_id, photo_object_detector, detector_name)
    if detector_reality_data is None:
        exit(1)

    # creating settings
    settings = rda.Objects2DJobCreateSettings(photo_scene_id=context_scene_reality_data.id(),
                                              photo_object_detector_id=detector_reality_data.id())

    # creating job
    job = rda.create_job(rda_client, project_id, settings, job_name)
    if job is None:
        exit(1)

    # calculating cost estimation
    estimated_cost = rda.cost_estimation(rda_client, job, number_of_photos=number_of_photos, giga_pixels=giga_pixels)
    print(f"Estimated job cost: {estimated_cost}")

    # submitting job
    job = rda.submit_job(rda_client, job)
    if job is None:
        exit(1)

    # monitoring job
    job = rda.monitor_job(rda_client, job)

    # retrieving results
    # After a completed job, the rd_client connection does not work anymore. Use a new client.
    rd_client2 = rd.RealityDataClient(token_factory, rd_api_server)
    if job is None or job.state() != rda.JobState.SUCCESS:
        exit(1)
    success = rda.download_job_outputs(rd_client2, rda_client, job, output_dir, rds_to_local_table)
    if not success:
        exit(1)
    exit(0)


if __name__ == "__main__":
    main()
