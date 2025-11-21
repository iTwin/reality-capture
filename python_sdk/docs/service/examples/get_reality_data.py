import reality_capture.service.service as service


# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = type('TokenProvider', (), {'get_token': lambda self: ""})()
reality_capture_service = service.RealityCaptureService(token_factory)
reality_data_info = reality_capture_service.get_reality_data(reality_data_id="9a39249d-70a4-4e13-b942-53fde8fb628c",
                                                             itwin_id="f7cb7bbb-c0fd-437d-af2a-au8c51zfc3c4")
