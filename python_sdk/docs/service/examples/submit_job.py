import reality_capture.service.service as service
import reality_capture.service.job as job
import reality_capture.specifications.fill_image_properties as fip


# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = type('TokenProvider', (), {'get_token': lambda self: ""})()
reality_capture_service = service.RealityCaptureService(token_factory)

fip_inputs = fip.FillImagePropertiesInputs(imageCollections=["0e1f94a1-88e6-4ee2-9167-4d759086298c"])
fip_outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
fip_options = fip.FillImagePropertiesOptions(altitudeReference=fip.AltitudeReference.SEA_LEVEL)
specifications = fip.FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs,
                                                             options=fip_options)
job_type = job.JobType.FILL_IMAGE_PROPERTIES

job_to_submit = job.JobCreate(name="Submit job exemple", specifications=specifications, type=job_type,
                              iTwinId="f7cb7bbb-c0fd-437d-af2a-au8c51zfc3c4")
submitted_job = reality_capture_service.submit_job(job=job_to_submit)
