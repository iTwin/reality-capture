import tempfile
import os

from reality_capture.on_premise import job_manager

with tempfile.TemporaryDirectory() as temp_folder:
    jm = job_manager.JobManager(os.path.join(temp_folder, "jq"))
    jf = job_manager.JobFilters(limit=10)
    res = jm.get_jobs(jf)
