import reality_capture.service.service as service
import reality_capture.service.job as job
import reality_capture.specifications.objects2d as objects2d


# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = None
reality_capture_service = service.RealityCaptureService(token_factory)

o2d_inputs = objects2d.Objects2DInputs(photos="401975b7-0c0a-4498-5896-84987921f4bb",
                                       photoObjectDetector="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
o2d_outputs = [objects2d.Objects2DOutputsCreate.OBJECTS2D]
o2d_options = objects2d.Objects2DOptions()
specifications = objects2d.Objects2DSpecificationsCreate(inputs=o2d_inputs, outputs=o2d_outputs, options=o2d_options)
job_type = job.JobType.OBJECTS_2D

job_to_submit = job.JobCreate(name="Submit job exemple", specifications=specifications, type=job_type,
                              itwin="f7cb7bbb-c0fd-437d-af2a-au8c51zfc3c4")
submitted_job = reality_capture_service.submit_job(job=job_to_submit)
