import reality_capture.service.service as service
import reality_capture.service.reality_data as reality_data


# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = None
reality_capture_service = service.RealityCaptureService(token_factory)

reality_data_update = reality_data.RealityDataUpdate(itwin_id="f7cb7bbb-c0fd-437d-af2a-au8c51zfc3c4",
                                                        display_name="Reality data example")
updated_reality_data = reality_capture_service.update_reality_data(reality_data_update=reality_data_update,
                                                                   reality_data_id=
                                                                   "9a39249d-70a4-4e13-b942-53fde8fb628c")
