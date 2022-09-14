# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import rd_api_sdk


def download_job_outputs(rd_client, rda_client, job_id, output_dir_path, reference_table):
    print("Downloading outputs...")
    code, job = rda_client.get_job(job_id)
    if not code.success():
        print("Job retrieval failed:", code)
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
