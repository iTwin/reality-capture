import responses
import json
import os

from reality_capture.service.service import RealityCaptureService
from reality_capture.service.job import Service, Jobs, JobCreate, JobType
from reality_capture.specifications.mesh_optimization import MeshOptimizationSpecifications
import reality_capture.specifications.fill_image_properties as fip


class FakeTokenFactory:
    @staticmethod
    def get_token() -> str:
        return "Bearer invalid"


class TestServiceJobCrud:
    # Utils
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.rcs = RealityCaptureService(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")

    def teardown_method(self, test_method):
        pass

    @responses.activate
    def test_submit_job_ill_formed(self):
        fip_inputs = fip.FillImagePropertiesInputs(imageCollections=["fad5be03-30ee-4801-90e0-dee0349e5bce",
                                                                     "e1cbd494-8e62-4004-89f9-8776aea1af50"])
        fip_outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
        fip_options = fip.FillImagePropertiesOptions(altitudeReference=fip.AltitudeReference.SEA_LEVEL)
        fips = fip.FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs, options=fip_options)
        jc = JobCreate(name="JCDC", type=JobType.FILL_IMAGE_PROPERTIES, iTwinId="itid", specifications=fips)
        responses.add(responses.POST, f'https://api.bentley.com/reality-modeling/jobs',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.submit_job(jc)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_submit_job_401(self):
        fip_inputs = fip.FillImagePropertiesInputs(imageCollections=["fad5be03-30ee-4801-90e0-dee0349e5bce",
                                                                     "e1cbd494-8e62-4004-89f9-8776aea1af50"])
        fip_outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
        fip_options = fip.FillImagePropertiesOptions(altitudeReference=fip.AltitudeReference.SEA_LEVEL)
        fips = fip.FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs, options=fip_options)
        jc = JobCreate(name="JCDC", type=JobType.FILL_IMAGE_PROPERTIES, iTwinId="itid", specifications=fips)
        responses.add(responses.POST, f'https://api.bentley.com/reality-modeling/jobs',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.submit_job(jc)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_submit_job_201(self):
        fip_inputs = fip.FillImagePropertiesInputs(imageCollections=["fad5be03-30ee-4801-90e0-dee0349e5bce",
                                                                     "e1cbd494-8e62-4004-89f9-8776aea1af50"])
        fip_outputs = [fip.FillImagePropertiesOutputsCreate.SCENE]
        fip_options = fip.FillImagePropertiesOptions(altitudeReference=fip.AltitudeReference.SEA_LEVEL)
        fips = fip.FillImagePropertiesSpecificationsCreate(inputs=fip_inputs, outputs=fip_outputs, options=fip_options)
        jc = JobCreate(name="JCDC", type=JobType.FILL_IMAGE_PROPERTIES, iTwinId="itid", specifications=fips)

        with open(f"{self.data_folder}/job_create_201.json", 'r') as payload_data:
            payload = json.load(payload_data)

        responses.add(responses.POST, f'https://api.bentley.com/reality-modeling/jobs',
                      json=payload,
                      status=201)
        response = self.rcs.submit_job(jc)
        assert not response.is_error()
        assert response.value.id == "796715aa-bc5a-4df5-9554-ceed038babc6"

    @responses.activate
    def test_submit_mesh_optimization(self):
        specs = {"inputs": {"meshes": ["mesh-id"]},
                 "options": {"outputFormat": "3DTiles_1.1", "outputCrs": "EPSG:4978"}}
        job = JobCreate(type=JobType.MESH_OPTIMIZATION, iTwinId="itwin", specifications=specs)
        payload = {"job": {
            "id": "job-id", "type": "MeshOptimization", "iTwinId": "itwin", "state": "Queued",
            "userId": "user", "executionInfo": {"createdDateTime": "2025-01-19T14:30:00Z"},
            "specifications": {**specs, "output": "output-id"},
        }}
        responses.add(responses.POST, "https://api.bentley.com/reality-conversion/jobs", json=payload, status=201)
        result = self.rcs.submit_job(job)
        assert not result.is_error()
        assert isinstance(result.value.specifications, MeshOptimizationSpecifications)
        sent = json.loads(responses.calls[0].request.body)
        assert sent["type"] == "MeshOptimization"
        assert sent["specifications"] == specs

    @responses.activate
    def test_get_job_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_job("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_job_200(self):
        with open(f"{self.data_folder}/job_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)

        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6',
                      json=payload,
                      status=200)
        response = self.rcs.get_job("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert not response.is_error()
        assert response.value.id == "796715aa-bc5a-4df5-9554-ceed038babc6"

    @responses.activate
    def test_get_job_progress_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6/progress',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_job_progress("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_job_progress_200(self):
        with open(f"{self.data_folder}/job_progress_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)

        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6/progress',
                      json=payload,
                      status=200)
        response = self.rcs.get_job_progress("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert not response.is_error()
        assert response.value.percentage == 5

    @responses.activate
    def test_cancel_job_ill_formed(self):
        responses.add(responses.DELETE, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.cancel_job("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_cancel_job_200(self):

        with open(f"{self.data_folder}/job_cancel_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.DELETE, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6',
                      json=payload,
                      status=200)
        response = self.rcs.cancel_job("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert not response.is_error()
        assert response.value.id == "796715aa-bc5a-4df5-9554-ceed038babc6"

    @responses.activate
    def test_get_job_messages_ill_formed(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6/messages',
                      json={"bad": "response"},
                      status=400)
        response = self.rcs.get_job_messages("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "UnknownError"

    @responses.activate
    def test_get_job_messages_401(self):
        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6/messages',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        response = self.rcs.get_job_messages("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert response.is_error()
        assert response.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_get_job_messages_200(self):
        with open(f"{self.data_folder}/job_messages_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)

        responses.add(responses.GET, f'https://api.bentley.com/reality-modeling/jobs/796715aa-bc5a-4df5-9554-ceed038babc6/messages',
                      json=payload,
                      status=200)
        response = self.rcs.get_job_messages("796715aa-bc5a-4df5-9554-ceed038babc6", Service.MODELING)
        assert not response.is_error()
        assert len(response.value.errors) == 1