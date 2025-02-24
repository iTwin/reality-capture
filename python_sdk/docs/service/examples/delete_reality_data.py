import reality_capture.service.service as service


# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = None
reality_capture_service = service.RealityCaptureService(token_factory)

deleted_reality_data = reality_capture_service.delete_reality_data(
    reality_data_id="9a39249d-70a4-4e13-b942-53fde8fb628c")
