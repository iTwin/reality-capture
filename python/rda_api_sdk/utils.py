# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Functions to facilitate creating and submitting a Reality Data Analysis job

import os
import time
import rd_api_sdk
from rda_api_sdk import JobCreate, JobState, JobCostEstimation


def create_job(rda_client, project_id, job_settings, job_name):
    """
    Create a new job

    :param rda_client: Reality Data Analysis Client
    :param project_id: Project id linking the job
    :param job_settings: Settings for the job
    :param job_name: Name for the job
    :return: created Job if successful (None otherwise)
    """
    job_create = JobCreate(job_settings=job_settings, job_name=job_name, project_id=project_id)
    code, job = rda_client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        return None
    print(f"Job {job.name()} [{job.id()}] created")
    return job


def delete_job(rda_client, job):
    """
    Delete existing job (job must be not submitted to be deleted)

    :param rda_client: Reality Data Analysis Client
    :param job: Job to delete. Must not have been submitted.
    :return: Boolean to indicate success
    """
    code = rda_client.delete_job(job.id())
    if not code.success():
        print("error while trying to delete job: ", code.error_code(), code.error_message())
    return code.success()


def submit_job(rda_client, job):
    """
    Submit a job

    :param rda_client: Reality Data Analysis Client
    :param job: Job to submit
    :return: submitted Job if successful (None otherwise)
    """
    code, job = rda_client.submit_job(job.id())
    if not code.success():
        print("Job submission failed:", code)
        return None
    print(f"Job submitted")
    return job


def cost_estimation(rda_client, job, **kwargs):
    """
    Estimate job cost

    :param rda_client: Reality Data Analysis Client
    :param job: Job to estimate cost
    :return: float
    """
    estimation = JobCostEstimation(**kwargs)
    return rda_client.get_job_estimated_cost(job.id(), estimation)


def monitor_job(rda_client, job):
    """
    Monitoring job

    :param rda_client: Reality Data Analysis Client
    :param job: Job to monitor
    :return: Job if successful (None otherwise)
    """
    # Track job progress
    job_id = job.id()
    backoff_interval = 2
    state = JobState.ACTIVE
    progress = -1
    error_count = 0
    while (state == JobState.ACTIVE or state == JobState.UNSUBMITTED) and error_count < 10:
        time.sleep(backoff_interval)
        code, job_progress = rda_client.get_job_progress(job_id)
        if not code.success():
            print(code)
            error_count += 1
            backoff_interval = min(backoff_interval * 1.2, 15)
        else:
            error_count = 0
            if state != job_progress.state() or progress != job_progress.percentage():
                state = job_progress.state()
                progress = job_progress.percentage()
                print(f"Job {job_id}: state={state} progress={progress}% step={job_progress.step()}")
                backoff_interval = 2
            else:
                backoff_interval = min(backoff_interval * 1.2, 15)

    # Get job outcome
    code, job = rda_client.get_job(job_id)
    if not code.success():
        # Cannot retrieve. In this simple sample, we act as if it failed
        print("Job status retrieval failed", code)
        return None
    print(f"{job.name()} finished with state {job.state()}")
    return job


def download_job_outputs(rd_client, rda_client, job, output_dir_path, reference_table):
    """
    Download RDAS job outputs

    :param rd_client: Reality Data Client
    :param rda_client: Reality Data Analysis Client
    :param job: Job to download outputs from
    :param output_dir_path: Path to the destination folder
    :param reference_table: Map from reality data id to folder path for every entry in the scene
    :return: Boolean to indicate success
    """
    code, job = rda_client.get_job(job.id())
    if not code.success():
        print("Failed to retrieve reality data:", code)
        return False
    for output in job.settings().outputs():
        output_path = os.path.join(output_dir_path, output.name())
        if not rd_api_sdk.download_reality_data_and_replace_references(
                rd_client=rd_client,
                rd_id=output.reality_data_id(),
                project_id=job.project_id(),
                destination_folder=output_path,
                reference_table=reference_table):
            return False
        print(f"Successfully downloaded {output.reality_data_id()} to {output_path}")
    return True
