# Functions to facilitate creating and submitting a Reality Data Analysis job

import time
import rda_api_sdk

from token_factory.token_factory import TokenFactory
from examples.config import ims_server, client_id


class RealityDataAnalysisTokenFactory(TokenFactory):
    def __init__(self, auth_point, token_point, redirect_url, client_id):
        super().__init__(auth_point, token_point, redirect_url, client_id)

    def get_read_token(self):
        return self.get_token(["realitydataanalysis:read", "realitydataanalysis:modify", "realitydata:modify", "realitydata:read", "offline_access"])

    def get_modify_token(self):
        return self.get_token(["realitydataanalysis:read", "realitydataanalysis:modify", "realitydata:modify", "realitydata:read", "offline_access"])


def get_token_factory():
    return RealityDataAnalysisTokenFactory("https://"+ims_server+"/connect/authorize",
                             "https://"+ims_server+"/connect/token",
                             "http://localhost:8080/sign-oidc",
                              client_id)


def create_and_submit_job(rda_client, project_id, settings, costEstimation, job_name):
    job_create = rda_api_sdk.JobCreate(job_settings=settings, job_name=job_name, project_id=project_id)
    code, job = rda_client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        return None
    print(f"Job {job.name()} [{job.id()}] created")

    estimatedCost = rda_client.get_job_estimated_cost(job.id(), costEstimation)
    print(f"Estimated job cost: {estimatedCost}")

    code, job = rda_client.submit_job(job.id())
    if not code.success():
        print("Job submission failed:", code)
        return ""
    print(f"Job submitted")
    return job.id()


def monitor_job(rda_client, job_id):
    # Track job progress
    backoff_interval = 2
    state = rda_api_sdk.JobState.ACTIVE
    progress = -1
    error_count = 0
    while (state == rda_api_sdk.JobState.ACTIVE or state == rda_api_sdk.JobState.UNSUBMITTED) and error_count < 10:
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
        print("Job retrieval failed:", code)
        return rda_api_sdk.JobState.FAILED
    print(f"{job.name()} finished with state {job.state()}")
    return job.state()

