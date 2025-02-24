from reality_capture.service.service import RealityCaptureService
from reality_capture.service.reality_data import (RealityDataCreate, RealityDataUpdate, Access,
                                                  RealityDataFilter, get_continuation_token, Prefer,
                                                  RealityDataMinimal, RealityData)
import responses
import json
import os
from datetime import datetime


class FakeTokenFactory:
    @staticmethod
    def get_token() -> str:
        return "Bearer invalid"


class TestRealityData:
    # Utils
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.rcs = RealityCaptureService(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")

    def teardown_method(self, test_method):
        pass

    # Create Data
    @responses.activate
    def test_create_data_ill_formed(self):
        rdc = RealityDataCreate(iTwinId="1b21484b-8d97-4610-9001-b0b67cd83fbd", displayName="My Data")
        responses.add(responses.POST, f'https://api.bentley.com/reality-management/reality-data/',
                      json={'bad': 'response'}, status=400)
        response = self.rcs.create_reality_data(rdc)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_create_data_401(self):
        rdc = RealityDataCreate(iTwinId="1b21484b-8d97-4610-9001-b0b67cd83fbd", displayName="My Data")
        responses.add(responses.POST, f'https://api.bentley.com/reality-management/reality-data/',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.create_reality_data(rdc)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_create_data_201(self):
        rdc = RealityDataCreate(iTwinId="1b21484b-8d97-4610-9001-b0b67cd83fbd", displayName="My Data")
        with open(f"{self.data_folder}/reality_data_create_201.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.POST, f'https://api.bentley.com/reality-management/reality-data/',
                      json=payload,
                      status=201)
        response = self.rcs.create_reality_data(rdc)
        assert not response.is_error()
        assert response.value.id == "95d8dccd-d89e-4287-bb5f-3219acbc71ae"

    # Get Data
    @responses.activate
    def test_get_data_ill_formed(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET, f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={'bad': 'response'}, status=400)
        response = self.rcs.get_reality_data(rd_id)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_data_401(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET, f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_reality_data(rd_id)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_data_200(self):
        rd_id = "95d8dccd-d89e-4287-bb5f-3219acbc71ae"
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET, f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json=payload, status=200)
        response = self.rcs.get_reality_data(rd_id)
        assert not response.is_error()
        assert response.value is not None
        assert response.value.id == rd_id

    @responses.activate
    def test_get_data_with_itwin_200(self):
        rd_id = "95d8dccd-d89e-4287-bb5f-3219acbc71ae"
        itwin_id = "f073e3f3-c91d-439e-ac46-3c8d98dc7097"
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}?iTwinId={itwin_id}',
                      json=payload, status=200)
        response = self.rcs.get_reality_data(rd_id, itwin_id)
        assert not response.is_error()
        assert response.value is not None
        assert response.value.id == rd_id

    # Update Data
    @responses.activate
    def test_update_data_ill_formed(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        itwin_id = "f073e3f3-c91d-439e-ac46-3c8d98dc7097"
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}?iTwinId={itwin_id}',
                      json={'bad': 'response'}, status=400)
        rdu = RealityDataUpdate(description="New description")
        response = self.rcs.update_reality_data(rdu, rd_id, itwin_id)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_update_data_401(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        rdu = RealityDataUpdate(description="New description")
        response = self.rcs.update_reality_data(rdu, rd_id)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_update_data_200(self):
        rd_id = "95d8dccd-d89e-4287-bb5f-3219acbc71ae"
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json=payload,
                      status=200)
        rdu = RealityDataUpdate(description="New description")
        response = self.rcs.update_reality_data(rdu, rd_id)
        assert not response.is_error()
        assert response.value is not None
        assert response.value.id == rd_id

    # Delete Data
    @responses.activate
    def test_delete_data_ill_formed(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.DELETE,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={'bad': 'response'}, status=400)
        response = self.rcs.delete_reality_data(rd_id)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_delete_data_401(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.DELETE,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.delete_reality_data(rd_id)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_delete_data_204(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.DELETE,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      status=204)
        response = self.rcs.delete_reality_data(rd_id)
        assert not response.is_error()
        assert response.value is None

    # Read access
    @responses.activate
    def test_read_access_ill_formed(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        itwin_id = "158ae23f-9596-4a8c-b0dc-df9db343697f"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess?iTwinId={itwin_id}',
                      json={'bad': 'response'}, status=400)
        response = self.rcs.get_reality_data_read_access(rd_id, itwin_id)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_read_access_401(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_reality_data_read_access(rd_id)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_read_access_200(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json=payload, status=200)
        response = self.rcs.get_reality_data_read_access(rd_id)
        assert not response.is_error()
        assert response.value.access == Access.READ

    # Write access
    @responses.activate
    def test_write_access_ill_formed(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        itwin_id = "158ae23f-9596-4a8c-b0dc-df9db343697f"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess?iTwinId={itwin_id}',
                      json={'bad': 'response'}, status=400)
        response = self.rcs.get_reality_data_write_access(rd_id, itwin_id)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_write_access_401(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_reality_data_write_access(rd_id)
        assert response.is_error()
        assert response.get_response_status_code() == 401
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_write_access_200(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_write_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)
        response = self.rcs.get_reality_data_write_access(rd_id)
        assert not response.is_error()
        assert response.value.access == Access.WRITE

    # List data
    @responses.activate
    def test_list_data_ill_formed(self):
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/'
                      f'?createdDateTime=2021-05-12T20%3A03%3A12Z%2F2022-05-12T20%3A03%3A12Z&dataCenter=East+US',
                      json={'bad': 'response'}, status=400)
        dt_s = datetime.strptime("2021-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        dt_e = datetime.strptime("2022-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        rdf = RealityDataFilter(dataCenter="East US", createdDateTime=(dt_s, dt_e))
        response = self.rcs.list_reality_data(rdf)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_list_data_422(self):
        with open(f"{self.data_folder}/reality_data_list_422.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/'
                      f'?createdDateTime=2021-05-12T20%3A03%3A12Z%2F2022-05-12T20%3A03%3A12Z&dataCenter=East+US',
                      json=payload, status=422)
        dt_s = datetime.strptime("2021-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        dt_e = datetime.strptime("2022-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        rdf = RealityDataFilter(dataCenter="East US", createdDateTime=(dt_s, dt_e))
        response = self.rcs.list_reality_data(rdf)
        assert response.is_error()
        assert response.error.error.code == "InvalidRealityDataRequest"

    @responses.activate
    def test_list_data_minimal_200(self):
        with open(f"{self.data_folder}/reality_data_list_minimal_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/'
                      f'?createdDateTime=2021-05-12T20%3A03%3A12Z%2F2022-05-12T20%3A03%3A12Z&dataCenter=East+US',
                      json=payload, status=200)
        dt_s = datetime.strptime("2021-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        dt_e = datetime.strptime("2022-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        rdf = RealityDataFilter(dataCenter="East US", createdDateTime=(dt_s, dt_e))
        response = self.rcs.list_reality_data(rdf)
        assert not response.is_error()
        assert len(response.value.reality_data) == 1
        assert isinstance(response.value.reality_data[0], RealityDataMinimal)
        assert get_continuation_token(response.value) == "eyJ0b3AiOjEwMCwic2tpcCI6MTAwfQ"

    @responses.activate
    def test_list_data_representation_200(self):
        with open(f"{self.data_folder}/reality_data_list_representation_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/'
                      f'?createdDateTime=2021-05-12T20%3A03%3A12Z%2F2022-05-12T20%3A03%3A12Z&dataCenter=East+US',
                      json=payload, status=200)
        dt_s = datetime.strptime("2021-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        dt_e = datetime.strptime("2022-05-12T20:03:12Z", "%Y-%m-%dT%H:%M:%SZ")
        rdf = RealityDataFilter(dataCenter="East US", createdDateTime=(dt_s, dt_e))
        response = self.rcs.list_reality_data(rdf, prefer=Prefer.REPRESENTATION)
        assert not response.is_error()
        assert len(response.value.reality_data) == 2
        assert isinstance(response.value.reality_data[0], RealityData)
        assert get_continuation_token(response.value) is None
