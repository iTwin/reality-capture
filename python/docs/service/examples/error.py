import reality_capture.service.service as service

# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = None
reality_capture_service = service.RealityCaptureService(token_factory)
job_info = reality_capture_service.get_job(job_id="0793856e-0et7-4b9c-a339-e2ca673aydad")
print(f"Service returned {job_info.get_response_status_code()}.")
if job_info.is_error():
    print(f"  Code: f{job_info.error.error.code}")
    print(f"  Message: f{job_info.error.error.message}")
    if job_info.error.error.details:
        for d in job_info.error.error.details:
            print(f"    Code: {d.code}")
            print(f"    Message: {d.message}")
