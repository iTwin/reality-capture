import reality_capture.service.service as service

# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = None
reality_capture_service = service.RealityCaptureService(token_factory)
progress = reality_capture_service.get_job_progress(job_id="0793856e-0et7-4b9c-a339-e2ca673aydad")
