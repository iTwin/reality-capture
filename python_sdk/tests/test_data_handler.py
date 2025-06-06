import json
import os
from collections import namedtuple

import responses
from reality_capture.service.data_handler import RealityDataHandler, BucketDataHandler
from unittest.mock import patch, MagicMock
import pytest
import tempfile


class FakeTokenFactory:
    @staticmethod
    def get_token() -> str:
        return "Bearer invalid"


def mock_blob(*args, **kwargs):
    if "progress_hook" in kwargs:
        kwargs["progress_hook"](50, None)  # Simulate progress update


def mock_blob_except(*args, **kwargs):
    raise Exception("this is a test")


@pytest.fixture
def mock_container_client_default():
    with patch("azure.storage.blob.ContainerClient.from_container_url") as mock_client:
        mock_instance = MagicMock()
        mock_client.return_value = mock_instance
        yield mock_client, mock_instance


class TestRealityDataHandler:
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.rdh = RealityDataHandler(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")

    def test_set_hook(self):
        self.rdh.set_progress_hook(lambda x: True)
        self.rdh.set_progress_hook(None)

    @responses.activate
    def test_list_data_link_error(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)

        r = self.rdh.list_data(rd_id)
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_list_data_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.list_blob_names.return_value = ["file1.txt", "file2.txt"]
        
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json=payload, status=200)
        
        r = self.rdh.list_data(rd_id)
        assert not r.is_error()
        assert r.get_response_status_code() == 200
        assert r.value == ['file1.txt', 'file2.txt']

    @responses.activate
    def test_upload_data_link_error(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        r = self.rdh.upload_data(rd_id, self.data_folder)
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_upload_data_authoring_error(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={"error": {"code": "InvalidRequest",
                                      "message": "Invalid request."}},
                      status=422)
        r = self.rdh.upload_data(rd_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert r.is_error()
        assert r.get_response_status_code() == 422
        assert r.error.error.code == "InvalidRequest"

    @responses.activate
    def test_upload_data_interrupted(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            pl_author = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json=pl_author, status=200)

        self.rdh.set_progress_hook(lambda x: False)
        r = self.rdh.upload_data(rd_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert r.is_error()
        assert r.get_response_status_code() == 499
        assert r.error.error.code == "UploadInterrupted"

    @responses.activate
    def test_upload_data_exception(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob_except

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            pl_author = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json=pl_author, status=200)

        r = self.rdh.upload_data(rd_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert r.is_error()
        assert r.get_response_status_code() == 500
        assert r.error.error.code == "UploadFailure"

    @responses.activate
    def test_upload_data_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            pl_author = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json=pl_author, status=200)

        self.rdh.set_progress_hook(None)
        r = self.rdh.upload_data(rd_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert not r.is_error()
        assert r.get_response_status_code() == 200

    @responses.activate
    def test_upload_data_authoring_error_end(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        with open(f"{self.data_folder}/reality_data_get_200.json", 'r') as payload_data:
            pl_author = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json=pl_author, status=200)
        responses.add(responses.PATCH,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}',
                      json={"error": {"code": "InvalidRequest",
                                      "message": "Invalid request."}},
                      status=422)

        self.rdh.set_progress_hook(None)
        r = self.rdh.upload_data(rd_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert r.is_error()
        assert r.get_response_status_code() == 422

    @responses.activate
    def test_download_data_link_error(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.rdh.download_data(rd_id, tmp_dir)
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_download_data_interrupted(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.download_blob.side_effect = mock_blob
        MyBlob = namedtuple("MyBlob", ["name", "size"])
        mock_client_instance.list_blobs.return_value = [MyBlob("a.txt", 100)]

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json=payload, status=200)

        self.rdh.set_progress_hook(lambda x: False)
        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.rdh.download_data(rd_id, tmp_dir)
        assert r.is_error()
        assert r.get_response_status_code() == 499
        assert r.error.error.code == "DownloadInterrupted"

    @responses.activate
    def test_download_data_exception(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.download_blob.side_effect = mock_blob_except
        MyBlob = namedtuple("MyBlob", ["name", "size"])
        mock_client_instance.list_blobs.return_value = [MyBlob("a.txt", 100)]

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json=payload, status=200)

        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.rdh.download_data(rd_id, tmp_dir)
        assert r.is_error()
        assert r.get_response_status_code() == 500
        assert r.error.error.code == "DownloadFailure"

    @responses.activate
    def test_download_data_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        MyBlob = namedtuple("MyBlob", ["name", "size"])
        mock_client_instance.list_blobs.return_value = [MyBlob("a.txt", 100)]
        mock_stream = MagicMock()
        mock_stream.readall.return_value = b"mocked file content"
        mock_client_instance.download_blob.return_value = mock_stream

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/readaccess',
                      json=payload, status=200)

        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.rdh.download_data(rd_id, tmp_dir)
            assert not r.is_error()
            assert r.get_response_status_code() == 200
            assert os.path.exists(os.path.join(tmp_dir, "a.txt"))

    @responses.activate
    def test_delete_data_link_error(self):
        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)

        r = self.rdh.delete_data(rd_id, ["a.txt"])
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_delete_bucket_fail(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.delete_blob.side_effect = mock_blob_except

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)

        r = self.rdh.delete_data(rd_id, ["a.txt"])
        assert r.is_error()
        assert r.get_response_status_code() == 400

    @responses.activate
    def test_delete_bucket_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.delete_blob = mock_blob

        rd_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/reality_data_read_access_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-management/reality-data/{rd_id}/writeaccess',
                      json=payload, status=200)

        r = self.rdh.delete_data(rd_id, ["a.txt"])
        assert not r.is_error()
        assert r.get_response_status_code() == 204


class TestBucketDataHandler:
    def setup_method(self, _):
        self.ftf = FakeTokenFactory()
        self.bdh = BucketDataHandler(self.ftf)
        cf = os.path.dirname(os.path.abspath(__file__))
        self.data_folder = os.path.join(cf, "data")

    def test_set_hook(self):
        self.bdh.set_progress_hook(lambda x: True)
        self.bdh.set_progress_hook(None)

    @responses.activate
    def test_list_bucket_link_error(self):
        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)

        r = self.bdh.list_data(itwin_id)
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_list_bucket_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.list_blob_names.return_value = ["file1.txt", "file2.txt"]

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        r = self.bdh.list_data(itwin_id)
        assert not r.is_error()
        assert r.get_response_status_code() == 200
        assert r.value == ['file1.txt', 'file2.txt']

    @responses.activate
    def test_upload_bucket_link_error(self):
        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        r = self.bdh.upload_data(itwin_id, self.data_folder)
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_upload_bucket_interrupted(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        self.bdh.set_progress_hook(lambda x: False)
        r = self.bdh.upload_data(itwin_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert r.is_error()
        assert r.get_response_status_code() == 499
        assert r.error.error.code == "UploadInterrupted"

    @responses.activate
    def test_upload_bucket_exception(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob_except

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        r = self.bdh.upload_data(itwin_id, f"{self.data_folder}")
        assert r.is_error()
        assert r.get_response_status_code() == 500
        assert r.error.error.code == "UploadFailure"

    @responses.activate
    def test_upload_bucket_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.upload_blob.side_effect = mock_blob

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        self.bdh.set_progress_hook(None)
        r = self.bdh.upload_data(itwin_id, f"{self.data_folder}/reality_data_read_access_200.json")
        assert not r.is_error()
        assert r.get_response_status_code() == 200

    @responses.activate
    def test_download_bucket_link_error(self):
        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)
        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.bdh.download_data(itwin_id, tmp_dir)
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_download_bucket_interrupted(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.download_blob.side_effect = mock_blob
        MyBlob = namedtuple("MyBlob", ["name", "size"])
        mock_client_instance.list_blobs.return_value = [MyBlob("a.txt", 100)]

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        self.bdh.set_progress_hook(lambda x: False)
        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.bdh.download_data(itwin_id, tmp_dir)
        assert r.is_error()
        assert r.get_response_status_code() == 499
        assert r.error.error.code == "DownloadInterrupted"

    @responses.activate
    def test_download_bucket_exception(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.download_blob.side_effect = mock_blob_except
        MyBlob = namedtuple("MyBlob", ["name", "size"])
        mock_client_instance.list_blobs.return_value = [MyBlob("a.txt", 100)]

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.bdh.download_data(itwin_id, tmp_dir)
        assert r.is_error()
        assert r.get_response_status_code() == 500
        assert r.error.error.code == "DownloadFailure"

    @responses.activate
    def test_download_bucket_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        MyBlob = namedtuple("MyBlob", ["name", "size"])
        mock_client_instance.list_blobs.return_value = [MyBlob("a.txt", 100)]
        mock_stream = MagicMock()
        mock_stream.readall.return_value = b"mocked file content"
        mock_client_instance.download_blob.return_value = mock_stream

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        with tempfile.TemporaryDirectory() as tmp_dir:
            r = self.bdh.download_data(itwin_id, tmp_dir)
            assert not r.is_error()
            assert r.get_response_status_code() == 200
            assert os.path.exists(os.path.join(tmp_dir, "a.txt"))

    @responses.activate
    def test_delete_bucket_link_error(self):
        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json={"error": {"code": "HeaderNotFound",
                                      "message": "Header Authorization was not found in the request. Access denied."}},
                      status=401)

        r = self.bdh.delete_data(itwin_id, ["a.txt"])
        assert r.is_error()
        assert r.get_response_status_code() == 401
        assert r.error.error.code == "HeaderNotFound"

    @responses.activate
    def test_delete_bucket_fail(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.delete_blob.side_effect = mock_blob_except

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        r = self.bdh.delete_data(itwin_id, ["a.txt"])
        assert r.is_error()
        assert r.get_response_status_code() == 400

    @responses.activate
    def test_delete_bucket_ok(self, mock_container_client_default):
        mock_client_class, mock_client_instance = mock_container_client_default
        mock_client_instance.delete_blob = mock_blob

        itwin_id = "d91751e9-9a24-417a-a29c-071c0dca33f0"
        with open(f"{self.data_folder}/bucket_get_200.json", 'r') as payload_data:
            payload = json.load(payload_data)
        responses.add(responses.GET,
                      f'https://api.bentley.com/reality-modeling/itwins/{itwin_id}/bucket',
                      json=payload, status=200)

        r = self.bdh.delete_data(itwin_id, ["a.txt"])
        assert not r.is_error()
        assert r.get_response_status_code() == 204
