# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

# Sample of using Reality Conversion service to make the conversion of a file
import time

import reality_apis.RC.reality_conversion_service as RC
from reality_apis.RC.rcs_utils import RCJobSettings
from token_factory.token_factory import ClientInfo, SpaDesktopMobileTokenFactory
from reality_apis.utils import JobState

from config import project_id, client_id


def main():

    file_to_convert = r"id of the file you want to convert"
    job_name = "Test Reality Conversion"

    print("Reality Conversion example: conversion of a file already uploaded to ContextShare")

    scope_set = {
        "realityconversion:modify",
        "realityconversion:read",
    }
    # only for desktop/mobile applications
    scope_set.add("offline_access")

    client_info = ClientInfo(client_id, scope_set)
    token_factory = SpaDesktopMobileTokenFactory(client_info)

    # initializing reality conversion service
    service_rc = RC.RealityConversionService(token_factory)
    print("Service initialized")

    # creating job settings
    settings = RCJobSettings()
    settings.inputs.LAZ.append(file_to_convert)
    settings.outputs.OPC = True
    print("Settings created")

    # creating and submitting job
    ret = service_rc.create_job(settings, job_name, project_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Created Job")
    job_id = ret.value
    ret = service_rc.submit_job(job_id)
    if ret.is_error():
        print("Error in submit:", ret.error)
        exit(1)
    print("Submitted Job")

    # tracking job progress
    while True:
        progress_ret = service_rc.get_job_progress(job_id)
        if progress_ret.is_error():
            print("Error while getting progress:", progress_ret.error)
            exit(1)
        job_progress = progress_ret.value
        if (
            job_progress.state == JobState.SUCCESS
            or job_progress.state == JobState.Completed
            or job_progress.state == JobState.Over
        ):
            break
        elif (
            job_progress.state == JobState.ACTIVE
            or job_progress.state == JobState.Running
        ):
            print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
        elif job_progress.state == JobState.CANCELLED:
            print("Job cancelled")
            exit(0)
        elif job_progress.state == JobState.FAILED:
            print("Job Failed")
            print(f"Progress: {str(job_progress.progress)}%, step: {job_progress.step}")
            exit(1)
        time.sleep(60)
    print("Job done")

    ret = service_rc.get_job_properties(job_id)
    if ret.is_error():
        print("Error while getting settings:", ret.error)
        exit(1)
    final_settings = ret.value.job_settings
    print("The id of the new file is:", final_settings.outputs.OPC[0])
    print("Successfully converted file")


if __name__ == "__main__":
    main()
