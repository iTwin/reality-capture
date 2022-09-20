# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a ContextCapture job
import os
import time
import shutil

import cc_api_wrapper as cc
import rd_api_wrapper as rd
from token_factory.token_factory import ServiceTokenFactory
from config import project_id, ims_server, client_id, cc_api_server, rd_api_server


def main():
    # we need to upload a CCimagecollection and a CCorientation file for this example
    # you should change the variables bellow to reflect the image collection and orientation you want to use
    # you can use the files from the example Photo Segmentation / Cracks3d located on our download page
    ###############################
    # ccimage_collections = r"C:\RDAS_Demo_Set\Image_Object-Face_License_Plates\images"
    # cc_orientation = r"C:\Orientations.xml"
    # output_dir = r"C:\output"
    ###############################

    # necessary scopes for the service
    scope_list = ["contextcapture:modify", "contextcapture:read", "realitydata:modify", "realitydata:read",
                  "offline_access"]

    print("Context Capture API sample")

    # creating token
    token_factory = ServiceTokenFactory(client_id, ims_server, scope_list)

    # creating clients for each service we will use
    cc_client = cc.ContextCaptureClient(token_factory, cc_api_server)
    rd_client = rd.RealityDataClient(token_factory, rd_api_server)

    # uploading images
    img_rd_create = rd.RealityDataCreate("My Image Collection", rd.Classification.UNDEFINED,
                                         "CCImageCollection", description="Some Image collection")
    code, img_reality_data = rd_client.create_reality_data(img_rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        exit(1)
    lap = time.perf_counter()
    code = rd_client.upload_files(img_reality_data.id(), project_id, ccimage_collections)
    if not code.success():
        print("Failed to upload reality data:", code)
        exit(1)
    print(f"Files were successfully uploaded in {round(time.perf_counter() - lap, 1)}s")

    # correcting cc_orientation paths
    # paths on the orientation file should point to the id of the CCimagecollection you want to use
    # this part of the code replaces the string "ReplaceWithCCImageCollectionsId" for the id of the CCimagecollection we just uploaded
    # opening the file in read mode
    file = open(os.path.join(cc_orientation, "orientations.xml"), "r")
    replacement = ""
    for line in file:
        line = line.strip()
        changes = line.replace("ReplaceWithCCImageCollectionsId", img_reality_data.id())
        replacement = replacement + changes + "\n"
    file.close()
    # writing new file
    if os.path.exists(os.path.join(cc_orientation, "temp")):
        shutil.rmtree(os.path.join(cc_orientation, "temp"))
    os.makedirs(os.path.join(cc_orientation, "temp"))
    fout = open(os.path.join(cc_orientation, "temp", "orientations.xml"), "w")
    fout.write(replacement)
    fout.close()

    # uploading cc_orientation
    or_rd_create = rd.RealityDataCreate("My CC orientation", rd.Classification.UNDEFINED,
                                        "CCOrientations", description="a cc orientation file")
    code, or_reality_data = rd_client.create_reality_data(or_rd_create, project_id)
    if not code.success():
        print("Failed to create reality data:", code)
        exit(1)
    # uploading file
    lap = time.perf_counter()
    code = rd_client.upload_files(or_reality_data.id(), project_id, os.path.join(cc_orientation, "temp"))
    if not code.success():
        print("Failed to upload reality data:", code)
        exit(1)
    print(f"Files were successfully uploaded in {round(time.perf_counter() - lap, 1)}s")

    # creating workspace
    workspace_name = "My Python Workspace"
    code, workspace = cc_client.create_workspace(cc.WorkspaceCreate(workspace_name, project_id))
    if not code.success():
        print("Workspace creation failed:", code)
        exit(1)
    print("Workspace:", workspace)

    # lets see how many engines we can use
    code, engines = cc_client.get_engines_limit(workspace.project_id())
    if not code.success():
        print("Failed to get engines limit:", code)
        exit(1)
    print(f"{engines} engines can be used for a job")

    # creating settings for a job
    settings = cc.JobCreateSettings(cc.MeshQuality.DRAFT, [cc.Format.CC_ORIENTATIONS], None, engines)

    # creating a job
    job_type = cc.JobType.CALIBRATION
    job_name = "Calib with Python"
    job_inputs = [cc.JobInput(or_reality_data.id(), "CC Orientations"),
                  cc.JobInput(img_reality_data.id(), "CC Image Collection")]
    job_create = cc.JobCreate(job_type, job_name, workspace.id(), job_inputs, settings)
    code, job = cc_client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        exit(1)
    print(f"Job {job.name()} [{job.id()}] created")

    # We want a full workflow, let's delete this job
    code = cc_client.delete_job(job.id())
    if not code.success():
        print("Job deletion failed:", code)
        exit(1)
    print(f"Job {job.name()} was deleted!")

    # creating new settings
    settings = cc.JobCreateSettings(cc.MeshQuality.MEDIUM,
                                    [cc.Format.CC_ORIENTATIONS, cc.Format.THREEMX, cc.Format.THREESM,
                                     cc.Format.WEB_SCALABLE_MESH], None, 0)

    # changing the job_create object
    job_create.job_type(cc.JobType.FULL)
    job_create.job_name("Full medium with Python")
    job_create.settings(settings)

    # creating new job
    code, job = cc_client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        exit(1)
    print(f"Job {job.name()} [{job.id()}] created")

    # let's estimate the cost of our processing
    code = cc_client.estimate_cost(job.id(), cc.ProcessingInformation(5.2, 0, 1.,
                                                                      cc.MeshQuality.MEDIUM,
                                                                      [cc.Format.CC_ORIENTATIONS,
                                                                       cc.Format.POD],
                                                                      cc.JobType.FULL))
    if not code.success():
        print("Cost estimation failed:", code)
        exit(1)

    print("estimation:", code.response()['job']['estimatedCost'])

    # submit job
    code = cc_client.submit_job(job.id())
    if not code.success():
        print("Job submission failed:", code)
        exit(1)
    print(f"Job {job.name()} submitted")
    time.sleep(5)

    # track job progress
    backoff_interval = 2
    state = cc.JobState.ACTIVE
    progress = -1
    error_count = 0

    while (state == cc.JobState.ACTIVE) and error_count < 10:
        time.sleep(backoff_interval)
        code, job_progress = cc_client.get_job_progress(job.id())
        if not code.success():
            print(code)
            error_count += 1
            backoff_interval = min(backoff_interval * 1.2, 15)
        else:
            error_count = 0
            if state != job_progress.state() or progress != job_progress.percentage():
                state = job_progress.state()
                progress = job_progress.percentage()
                print(f"Job {job.id()}: state={state} progress={progress}% step={job_progress.step()}")
                backoff_interval = 2
            else:
                backoff_interval = min(backoff_interval * 1.2, 15)

    # get job outcome
    code, job = cc_client.get_job(job.id())
    if not code.success():
        # Cannot retrieve. In this simple sample, we act as if it failed
        print("Job retrieval failed:", code)
        exit(1)
    print(f"{job.name()} finished.")

    # downloading files
    print("Downloading files...")
    # After a completed job, the rd_client connection may not work anymore. Use a new client.
    rd_client2 = rd.RealityDataClient(token_factory, rd_api_server)
    for outputs in job.settings().outputs():
        lap = time.perf_counter()
        code = rd_client2.download_files(outputs.reality_data_id(), project_id, os.path.join(output_dir, outputs.format()))
        if not code.success():
            print("Failed to download reality data:", code)
            exit(1)
        print(f"File was successfully downloaded in {round(time.perf_counter() - lap, 1)}s")

    print("download finished.")


if __name__ == "__main__":
    main()
