import reality_capture.service.service as service
import reality_capture.service.job as job


# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = None
reality_capture_service = service.RealityCaptureService(token_factory)
# You must define specifications to describe the job you want to submit. See specifications examples.
specifications = None
job_type = None

job_to_submit = job.JobCreate(name="Submit job exemple", specifications=specifications, type=job_type,
                              itwin="f7cb7bbb-c0fd-437d-af2a-au8c51zfc3c4")
submitted_job = reality_capture_service.submit_job(job=job_to_submit)
