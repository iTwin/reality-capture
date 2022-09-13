# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a Reality Data Analysis job segmenting orthophoto

import rd_api_sdk
import rda_api_sdk
from examples import utils
from examples.config import project_id, rda_api_server, rd_api_server


def run_segmentation2d_orthophoto_job(rda_client, project_id, context_scene_id, detector_id, job_name):
    settings = rda_api_sdk.Segmentation2DJobCreateSettings(orthophoto_scene_id=context_scene_id,
                                                           orthophoto_segmentation_detector_id=detector_id,
                                                           export_contours=True)

    cost_estimation = rda_api_sdk.JobCostEstimation(scene_width=1, scene_length=1, detector_scale=0.01)

    job_id = utils.create_and_submit_job(rda_client, project_id, settings, cost_estimation, job_name)
    if job_id is None:
        return None, None
    job_state = utils.monitor_job(rda_client, job_id)
    return job_state, job_id


def main():
    print("Reality Data Analysis sample job segmenting orthophoto")

    token_factory = utils.get_token_factory()
    rd_client = rd_api_sdk.RealityDataClient(token_factory, rd_api_server)
    rda_client = rda_api_sdk.RealityDataAnalysClient(token_factory, rda_api_server)

    # you should change these variables to reflect the images collections, contextScene and detector you want to use
    # output_dir is the folder where the result of the analysis will be saved in your computer
    ###############################
    # ccimage_collections = [ "C:\RDAS_Demo_Set\Orthophoto_Segmentation_Roofs\images" ]
    # orthophotos = r"C:\RDAS_Demo_Set\Orthophoto_Segmentation_Roofs\ContextScene.xml"
    # orthophoto_segmentation_detector = r"C:\roofsB_1"
    # output_dir = r"C:\output\Orthophoto"
    # job_name = "S2D orthophoto job sample"
    # detector_name = "Orthophoto in RAS-QA"
    ###############################

    # uploading scene
    context_scene_reality_data, local_to_rds_table, rds_to_local_table = rd_api_sdk.upload_context_scene_and_dependencies(rd_client, project_id, orthophotos, ccimage_collections)
    if context_scene_reality_data is None:
        exit(1)

    # uploading detector
    detector_reality_data = rd_api_sdk.upload_detector(rd_client, project_id, orthophoto_segmentation_detector, detector_name)
    if detector_reality_data is None:
        exit(1)

    # running a job
    job_state, job_id = run_segmentation2d_orthophoto_job(rda_client, project_id, context_scene_reality_data.id(), detector_reality_data.id(), job_name)
    if job_id is None or job_state != rda_api_sdk.JobState.SUCCESS:
        exit(1)

    # retrieving results
    # After a completed job, the rd_client connection does not work anymore. Use a new client.
    rd_client2 = rd_api_sdk.RealityDataClient(token_factory, rd_api_server)
    success = rda_api_sdk.download_job_outputs(rd_client2, rda_client, job_id, output_dir, rds_to_local_table)
    if not success:
        exit(1)
    print(f"Successfully downloaded output to {output_dir}")

    exit(0)


if __name__ == "__main__":
    main()
