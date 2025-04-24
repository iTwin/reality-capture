import os.path
from typing import Optional
from reality_capture.service.error import DetailedErrorResponse
from reality_capture.service.response import Response
from reality_capture.service.service import RealityCaptureService
from reality_capture.service.reality_data import RealityDataUpdate, RealityData, ContainerDetails
from azure.storage.blob import ContainerClient
from multiprocessing.pool import ThreadPool


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

        files = self._get_files_and_sizes(src)
        nb_threads = self._get_nb_threads(files)
        total_size = sum(size for _, size in files)
        proceed = True
        uploaded_values = {}

        r = self._get_link(reality_data_id, itwin_id, False)
        if r.is_error():
            return Response(r.status_code, r.error, None)
        sas_uri = r.value.links.container_url.href

        r = self._set_authoring(reality_data_id, True)
        if r.is_error():
            return Response(r.status_code, r.error, None)

        def _upload_file(file_tuple):
            def _upload_callback(current, _):
                nonlocal uploaded_values
                uploaded_values[file_tuple[0]] = current
                percentage = (sum(uploaded_values.values()) / total_size) * 100
                nonlocal proceed
                if self._progress_hook is not None:
                    proceed = proceed and self._progress_hook(percentage)
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
        finally:
            r = self._set_authoring(reality_data_id, False)
            if r.is_error():
                return Response(r.status_code, r.error, None)
        return Response(200, None, None)

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
        sas_uri = r.value.links.container_url.href
        client = ContainerClient.from_container_url(sas_uri)
        blobs_tuple = [(blob.name, blob.size) for blob in client.list_blobs()
                       if blob.name.startswith(reality_data_src)]
        nb_threads = self._get_nb_threads(blobs_tuple)

        total_size = sum(n for _, n in blobs_tuple)
        proceed = True
        downloaded_values = {}

        def _download_blob(blob_tuple):
            def _download_callback(current, _):
                nonlocal downloaded_values
                downloaded_values[blob_tuple[0]] = current
                percentage = (sum(downloaded_values.values()) / total_size) * 100
                nonlocal proceed
                if self._progress_hook is not None:
                    proceed = proceed and self._progress_hook(percentage)
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
        client = ContainerClient.from_container_url(r.value.links.container_url.href)
        blob_names = [name for name in client.list_blob_names()]
        return Response(200, None, blob_names)

    def set_progress_hook(self, hook: Optional) -> None:
        """
        Set the progress hook.

        :param hook: Function taking a float as an argument and returning a bool.
         When returning false, the ongoing action will be cancelled. Can be None if no progress hook is needed.
        """
        self._progress_hook = hook
