import os.path
from typing import Optional
from reality_capture.service.error import DetailedErrorResponse
from reality_capture.service.response import Response
from reality_capture.service.service import RealityCaptureService
from reality_capture.service.reality_data import RealityDataUpdate, RealityData, ContainerDetails
from reality_capture.service.bucket import BucketResponse
from azure.storage.blob import ContainerClient
from multiprocessing.pool import ThreadPool


class _DataHandler:
    @staticmethod
    def _get_files_and_sizes(path: str) -> list[(str, int)]:
        if os.path.isdir(path):
            files_tuple = [
                (
                    os.path.relpath(os.path.join(dp, f), path),
                    os.path.getsize(os.path.join(dp, f)),
                )
                for dp, dn, filenames in os.walk(path)
                for f in filenames
            ]
        else:
            files_tuple = [(os.path.basename(path), os.path.getsize(path))]
        return files_tuple

    @staticmethod
    def _get_nb_threads(files: list[(str, int)]) -> int:
        size_threshold = 5 * 1024 * 1024  # 5mb
        nb_small_files = sum(size <= size_threshold for _, size in files)
        return min(32, 4 + nb_small_files // 100)  # control number of threads considering quantity of files

    @staticmethod
    def download_data(container_url: str, dst: str, folder_src: str, progress_hook):
        sas_uri = container_url
        client = ContainerClient.from_container_url(sas_uri)
        blobs_tuple = [(blob.name, blob.size) for blob in client.list_blobs()
                       if blob.name.startswith(folder_src)]
        nb_threads = _DataHandler._get_nb_threads(blobs_tuple)

        total_size = sum(n for _, n in blobs_tuple)
        proceed = True
        downloaded_values = {}

        def _download_blob(blob_tuple):
            def _download_callback(current, _):
                nonlocal downloaded_values
                downloaded_values[blob_tuple[0]] = current
                percentage = (sum(downloaded_values.values()) / total_size) * 100
                nonlocal proceed
                if progress_hook is not None:
                    proceed = proceed and progress_hook(percentage)
                if not proceed:
                    raise InterruptedError("Download interrupted by callback function")

            data = client.download_blob(
                blob_tuple[0],
                connection_timeout=60,
                max_concurrency=16,
                retry_total=20,
                retry_connect=10,
                progress_hook=_download_callback,
            ).readall()

            download_file_path = os.path.join(dst, blob_tuple[0])
            os.makedirs(os.path.dirname(download_file_path), exist_ok=True)

            with open(download_file_path, "wb") as file:
                file.write(data)
            nonlocal downloaded_values
            downloaded_values[blob_tuple[0]] = blob_tuple[1]

        try:
            with ThreadPool(processes=nb_threads) as pool:
                pool.map(_download_blob, blobs_tuple)
        except InterruptedError as _:
            de = DetailedErrorResponse(error={"code": "DownloadInterrupted",
                                              "message": "Download was interrupted by user."})
            return Response(499, de, None)
        except Exception as e:
            de = DetailedErrorResponse(error={"code": "DownloadFailure",
                                              "message": f"Download failed: {e}."})
            return Response(500, de, None)
        return Response(200, None, None)

    @staticmethod
    def upload_data(container_url, src: str, reality_data_dst: str, progress_hook):
        files = _DataHandler._get_files_and_sizes(src)
        nb_threads = _DataHandler._get_nb_threads(files)
        total_size = sum(size for _, size in files)
        proceed = True
        uploaded_values = {}
        sas_uri = container_url

        def _upload_file(file_tuple):
            def _upload_callback(current, _):
                nonlocal uploaded_values
                uploaded_values[file_tuple[0]] = current
                percentage = (sum(uploaded_values.values()) / total_size) * 100
                nonlocal proceed
                if progress_hook is not None:
                    proceed = proceed and progress_hook(percentage)
                if not proceed:
                    raise InterruptedError("Upload interrupted by callback function")

            client = ContainerClient.from_container_url(sas_uri)
            file_path = os.path.join(src, file_tuple[0]) if os.path.isdir(src) else src
            with open(file_path, "rb") as data:
                client.upload_blob(
                    os.path.join(reality_data_dst, file_tuple[0]),
                    data,
                    connection_timeout=60,
                    max_concurrency=16,
                    retry_total=20,
                    retry_connect=10,
                    progress_hook=_upload_callback,
                    overwrite=True,
                )
            nonlocal uploaded_values
            uploaded_values[file_tuple[0]] = file_tuple[1]

        try:
            with ThreadPool(processes=nb_threads) as pool:
                pool.map(_upload_file, files)
        except InterruptedError as _:
            de = DetailedErrorResponse(error={"code": "UploadInterrupted",
                                              "message": "Upload was interrupted by user."})
            return Response(499, de, None)
        except Exception as e:
            de = DetailedErrorResponse(error={"code": "UploadFailure",
                                              "message": f"Upload failed: {e}."})
            return Response(500, de, None)
        return Response(200, None, None)

    @staticmethod
    def list_data(container_url: str) -> Response[list[str]]:
        client = ContainerClient.from_container_url(container_url)
        blob_names = [name for name in client.list_blob_names()]
        return Response(200, None, blob_names)


class RealityDataHandler:
    """
    Class for uploading to, downloading from, and listing a reality data
    """

    def __init__(self, token_factory, **kwargs) -> None:
        """
        Constructor method

        :param token_factory: An object that implements a ``get_token() -> str`` method.
        :type token_factory: Object
        :param \**kwargs: Internal parameters used only for development purposes.
        """
        self._service = RealityCaptureService(token_factory, **kwargs)
        self._progress_hook = None

    def _get_link(self, rd_id: str, itwin_id: Optional[str], read_only: bool) -> Response[ContainerDetails]:
        if not read_only:
            return self._service.get_reality_data_write_access(rd_id, itwin_id)
        return self._service.get_reality_data_read_access(rd_id, itwin_id)

    def _set_authoring(self, rd_id: str, authoring: bool) -> Response[RealityData]:
        rdu = RealityDataUpdate(authoring=authoring)
        return self._service.update_reality_data(rdu, rd_id)

    def upload_data(self, reality_data_id: str, src: str,
                    reality_data_dst: str = "", itwin_id: Optional[str] = None) -> Response[None]:
        """
        Upload files to a reality data.

        :param reality_data_id: Id of the Reality Data.
        :param src: Source path to upload. If directory, all the files in the directory will be uploaded recursively.
        :param reality_data_dst: Destination of the data inside the Reality Data, default to root.
        :param itwin_id: Optional iTwin id for finding the reality data.
        :return: A Response[None] containing the error from the service if any.
        """

        rlink = self._get_link(reality_data_id, itwin_id, False)
        if rlink.is_error():
            return Response(rlink.status_code, rlink.error, None)
        r = self._set_authoring(reality_data_id, True)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        resp = _DataHandler.upload_data(rlink.value.links.container_url.href,
                                        src, reality_data_dst, self._progress_hook)
        r = self._set_authoring(reality_data_id, False)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        return resp

    def download_data(self, reality_data_id: str, dst: str,
                      reality_data_src: str = "", itwin_id: Optional[str] = None) -> Response[None]:
        """
        Download files from a reality data.

        :param reality_data_id: Id of the Reality Data.
        :param dst: Destination path of the downloads.
        :param reality_data_src: Source folder to download in the Reality Data, default to root.
        :param itwin_id: Optional iTwin id for finding the reality data.
        :return: A Response[None] containing the error from the service if any.
        """
        r = self._get_link(reality_data_id, itwin_id, True)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        return _DataHandler.download_data(r.value.links.container_url.href, dst, reality_data_src, self._progress_hook)

    def list_data(self, reality_data_id, itwin_id: Optional[str] = None) -> Response[list[str]]:
        """
        List all the files inside a reality data.

        :param reality_data_id: Id of the Reality Data.
        :param itwin_id: Optional iTwin id for finding the reality data.
        :return: A Response[list[str]] containing either the files in the Reality Data or the error from the service.
        """
        r = self._get_link(reality_data_id, itwin_id, True)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        return _DataHandler.list_data(r.value.links.container_url.href)

    def set_progress_hook(self, hook: Optional) -> None:
        """
        Set the progress hook.

        :param hook: Function taking a float as an argument and returning a bool.
         When returning false, the ongoing action will be cancelled. Can be None if no progress hook is needed.
        """
        self._progress_hook = hook


class BucketDataHandler:
    """
    Class for uploading to, downloading from, and listing a bucket
    """

    def __init__(self, token_factory, **kwargs) -> None:
        """
        Constructor method

        :param token_factory: An object that implements a ``get_token() -> str`` method.
        :type token_factory: Object
        :param \**kwargs: Internal parameters used only for development purposes.
        """
        self._service = RealityCaptureService(token_factory, **kwargs)
        self._progress_hook = None

    def _get_bucket(self, itwin_id: str) -> Response[BucketResponse]:
        return self._service.get_bucket(itwin_id)

    def upload_data(self, itwin_id: str, src: str, bucket_dst: str = "", ) -> Response[None]:
        """
        Upload files to a bucket.

        :param itwin_id: iTwin id for finding the bucket.
        :param src: Source path to upload. If directory, all the files in the directory will be uploaded recursively.
        :param bucket_dst: Destination of the data inside the bucket, default to root.
        :return: A Response[None] containing the error from the service if any.
        """

        r = self._get_bucket(itwin_id)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        return _DataHandler.upload_data(r.value.links.container_url.href, src, bucket_dst, self._progress_hook)

    def download_data(self, itwin_id: str, dst: str,
                      bucket_src: str = "") -> Response[None]:
        """
        Download files from a bucket.

        :param itwin_id: iTwin id for finding the bucket.
        :param dst: Destination path of the downloads.
        :param bucket_src: Source folder to download in the bucket, default to root.
        :return: A Response[None] containing the error from the service if any.
        """
        r = self._get_bucket(itwin_id)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        return _DataHandler.download_data(r.value.links.container_url.href, dst, bucket_src, self._progress_hook)

    def list_data(self, itwin_id: str) -> Response[list[str]]:
        """
        List all the files inside a bucket.

        :param itwin_id: iTwin id for finding the bucket.
        :return: A Response[list[str]] containing either the files in the bucket or the error from the service.
        """
        r = self._get_bucket(itwin_id)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        return _DataHandler.list_data(r.value.links.container_url.href)

    def set_progress_hook(self, hook: Optional) -> None:
        """
        Set the progress hook.

        :param hook: Function taking a float as an argument and returning a bool.
         When returning false, the ongoing action will be cancelled. Can be None if no progress hook is needed.
        """
        self._progress_hook = hook
