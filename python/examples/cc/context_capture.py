# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample creating and submitting a ContextCapture job

import time

import cc_api_sdk
from token_factory.token_factory import TokenFactory


# ============================================
ims_server = "qa-ims.bentley.com"
api_server = "qa-api.bentley.com"
client_id = "my_client_id"
# ============================================


class ContextCaptureTokens(TokenFactory):
    def __init__(self, auth_point, token_point, redirect_url, client_id):
        super().__init__(auth_point, token_point, redirect_url, client_id)

    def get_read_token(self):
        return self.get_token(["contextcapture:modify", "contextcapture:read", "realitydata:modify", "realitydata:read", "offline_access"])

    def get_modify_token(self):
        return self.get_token(["contextcapture:modify", "contextcapture:read", "realitydata:modify", "realitydata:read", "offline_access"])


def main():
    print("Context Capture API sample")

    token_factory = ContextCaptureTokens("https://"+ims_server+"/connect/authorize",
                                      "https://"+ims_server+"/connect/token",
                                      "http://localhost:8080/sign-oidc",
                                      client_id
                                      )

    client = cc_api_sdk.ContextCaptureClient(token_factory, api_server)

    # Create workspace
    code, workspace = client.create_workspace(cc_api_sdk.WorkspaceCreate("My Python Workspace",
                                                                         "ad14b27c-91ea-4492-9433-1e2d6903b5e4"))
    if not code.success():
        print("Workspace creation failed:", code)
        exit(1)
    print("Workspace:", workspace)

    # How many engines can we use?
    code, engines = client.get_engines_limit(workspace.project_id())
    if not code.success():
        print("Failed to get engines limit:", code)
        exit(1)
    print(f"{engines} engines can be used for a job")

    # Create job
    settings = cc_api_sdk.JobCreateSettings(
        cc_api_sdk.MeshQuality.DRAFT,
        [cc_api_sdk.Format.CC_ORIENTATIONS],
        None,
        engines
    )
    job_create = cc_api_sdk.JobCreate(
        cc_api_sdk.JobType.CALIBRATION,
        "Calib with Python",
        workspace.id(),
        [cc_api_sdk.JobInput("29073d0f-530f-40c7-91de-1c44d82dc0b7", "CC Orientations"),
         cc_api_sdk.JobInput("d0509257-bc0d-4201-b005-48af9f5b3b5a", "CC Image Collection")],
        settings
    )
    code, job = client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        exit(1)
    print(f"Job {job.name()} [{job.id()}] created")

    # Realized we made a mistake! We want a full workflow!
    code = client.delete_job(job.id())
    if not code.success():
        print("Job deletion failed:", code)
        exit(1)
    print(f"Job {job.name()} was deleted!")

    job_create.job_type(cc_api_sdk.JobType.FULL)
    job_create.job_name("Full with Python")
    settings = cc_api_sdk.JobCreateSettings(
        cc_api_sdk.MeshQuality.DRAFT,
        [cc_api_sdk.Format.CC_ORIENTATIONS, cc_api_sdk.Format.THREEMX],
        None,
        engines
    )
    job_create.settings(settings)
    code, job = client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        exit(1)
    print(f"Job {job.name()} [{job.id()}] created")

    # Let's estimate the cost of our processing
    code = client.estimate_cost(job.id(), cc_api_sdk.ProcessingInformation(5.2, 0, 1.,
                                                                       cc_api_sdk.MeshQuality.MEDIUM,
                                                                       [cc_api_sdk.Format.CC_ORIENTATIONS,
                                                                        cc_api_sdk.Format.POD],
                                                                       cc_api_sdk.JobType.FULL))
    if not code.success():
        print("Cost estimation failed:", code)
        exit(1)

    # Submit job
    code = client.submit_job(job.id())
    if not code.success():
        print("Job submission failed:", code)
        exit(1)
    print(f"Job {job.name()} submitted")
    time.sleep(5)

    # Whoops, we forgot about the quality, let's cancel the job
    code = client.cancel_job(job.id())
    if not code.success():
        print("Job cancellation failed:", code)
        exit(1)
    print(f"Job {job.name()} was cancelled!")

    # Now we have exactly all the parameters we need
    settings = cc_api_sdk.JobCreateSettings(
        cc_api_sdk.MeshQuality.MEDIUM,
        [cc_api_sdk.Format.CC_ORIENTATIONS, cc_api_sdk.Format.THREEMX, cc_api_sdk.Format.THREESM, cc_api_sdk.Format.WEB_SCALABLE_MESH],
        None,
        0
    )
    job_create.settings(settings)
    job_create.job_name("Full Medium Python")
    code, job = client.create_job(job_create)
    if not code.success():
        print("Job creation failed:", code)
        exit(1)
    print(f"Job {job.name()} [{job.id()}] created")

    # Let's estimate the cost of our processing
    code = client.estimate_cost(job.id(), cc_api_sdk.ProcessingInformation(5.2, 0, 1.,
                                                                       cc_api_sdk.MeshQuality.MEDIUM,
                                                                       [cc_api_sdk.Format.CC_ORIENTATIONS,
                                                                        cc_api_sdk.Format.POD],
                                                                       cc_api_sdk.JobType.FULL))
    if not code.success():
        print("Cost estimation failed:", code)
        exit(1)

    # Submit job
    code = client.submit_job(job.id())
    if not code.success():
        print("Job submission failed:", code)
        exit(1)
    print(f"Job {job.name()} submitted")
    time.sleep(5)

    # Track job progress
    backoff_interval = 7.5
    state = job.state()
    progress = -1
    error_count = 0
    while state != cc_api_sdk.JobState.COMPLETED and error_count < 10:
        code, job_progress = client.get_job_progress(job.id())
        if not code.success():
            print(code)
            error_count += 1
            backoff_interval = min(backoff_interval * 2, 120)
            time.sleep(backoff_interval)
            continue
        error_count = 0
        state = job_progress.state()
        if job_progress.percentage() != progress:
            progress = job_progress.percentage()
            print(f"{job.name()}: {progress}% - Step {job_progress.step()}")
            backoff_interval = 7.5
        backoff_interval = min(backoff_interval * 2, 120)
        time.sleep(backoff_interval)

    # TODO : "state" is still None, so this part of he code is never reached
    # Get job outcome
    code, job = client.get_job(job.id())
    if not code.success():
        print("Job retrieval failed:", code)
        exit(1)

    print(f"{job.name()} finished with outcome {job.execution_information().outcome().value}")
    exit(0)


if __name__ == "__main__":
    main()
