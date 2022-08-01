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
        return self.get_token(["contextcapture:modify", "contextcapture:read", "offline_access"])

    def get_modify_token(self):
        return self.get_token(["contextcapture:modify", "contextcapture:read", "offline_access"])


def main():
    print("Context Capture API sample")

    token_factory = ContextCaptureTokens("https://"+ims_server+"/connect/authorize",
                                      "https://"+ims_server+"/connect/token",
                                      "http://localhost:8080/sign-oidc",
                                      client_id
                                      )

    client = cc_api_sdk.ContextCaptureClient(token_factory, api_server)

    # First we check that we have full access to the service
    code, access_info = client.get_user_access(None)
    if not code.success():
        print("Request failed:", code)
        exit(1)
    print(access_info)
    if not access_info.has_access():
        exit(1)

    # Create workspace
    code, workspace = client.create_workspace(cc_api_sdk.WorkspaceCreate("My Python Workspace",
                                                                         "a39783dc-6fa6-4652-85a3-f84633dfa293"))
    if not code.success():
        print("Workspace creation failed:", code)
        exit(1)
    print("Workspace:", workspace)

    # Let's estimate the cost of our processing
    code, bill = client.estimate_cost(cc_api_sdk.ProcessingInformation(5.2, 0, 1.,
                                                                       cc_api_sdk.MeshQuality.MEDIUM,
                                                                       [cc_api_sdk.Format.CC_ORIENTATIONS,
                                                                        cc_api_sdk.Format.POD],
                                                                       cc_api_sdk.JobType.FULL))
    if not code.success():
        print("Cost estimation failed:", code)
        exit(1)
    print("Cost estimate:", bill)

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
        [cc_api_sdk.JobInput("2a9f0ad9-abcc-4916-a3f1-c858107fdadf", "CC Orientations"),
         cc_api_sdk.JobInput("16375671-cf3c-4562-9fac-aae6cff638e4", "CC Image Collection")],
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

    # Submit job
    code, job = client.submit_job(job.id())
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

    # Submit job
    code, job = client.submit_job(job.id())
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

    # Get job outcome
    code, job = client.get_job(job.id())
    if not code.success():
        print("Job retrieval failed:", code)
        exit(1)

    print(f"{job.name()} finished with outcome {job.execution_information().outcome().value}")
    exit(0)


if __name__ == "__main__":
    main()
