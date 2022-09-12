from typing import List

from cc_api_sdk.enums import MeshQuality, JobType, AccessStatus, Format


class ProcessingInformation:
    """
    Processing information are needed to estimate the cost of a job
    """

    def __init__(self, giga_pixels: float, mega_points: float, input_size_gb: float,
                 mesh_quality: MeshQuality, formats: list, job_type: JobType):
        """
        Constructor

        :param giga_pixels: total gigapixels size of your photos
        :param mega_points: number of mega points (10^6) in your point clouds
        :param input_size_gb: size of your input data (photos+point clouds)
        :param mesh_quality: desired quality of the mesh
        :param formats: desired output formats
        :param job_type: Type of job to be processed
        """
        self._giga_pixels = giga_pixels
        self._mega_points = mega_points
        self._input_size = input_size_gb
        self._quality = mesh_quality
        self._formats = formats
        self._job_type = job_type

    def giga_pixels(self, gp: float = None) -> float:
        """
        Getter/setter for total gigapixels size of your photos

        :param gp: Optional new gigapixels size
        :return: Total gigapixels size of your photos
        """
        if gp is not None:
            self._giga_pixels = gp
        return self._giga_pixels

    def mega_points(self, mp: float = None) -> float:
        """
        Getter/setter for number of mega points (10^6) in your point clouds

        :param mp: Optional new number of mega points
        :return: Number of mega points in your point clouds
        """
        if mp is not None:
            self._mega_points = mp
        return self._mega_points

    def input_size(self, in_size: float = None) -> float:
        """
        Getter/setter for data input size

        :param in_size: Optional new data input size
        :return: Data input size in GB
        """
        if in_size is not None:
            self._input_size = in_size
        return self._input_size

    def quality(self, q: MeshQuality = None) -> MeshQuality:
        """
        Getter/setter for mesh quality

        :param q: Optional new quality
        :return: Quality of the mesh
        """
        if q is not None:
            self._quality = q
        return self._quality

    def formats(self, formats: List[Format] = None) -> List[Format]:
        """
        Getter/setter for list of output formats

        :param formats: Optional new list of formats
        :return: Desired output formats
        """
        if formats is not None:
            self._formats = formats
        return self._formats

    def job_type(self, jt: JobType = None) -> JobType:
        """
        Getter/setter for job type

        :param jt: Optional new job type
        :return: Type of job to be processed
        """
        if jt is not None:
            self._job_type = jt
        return self._job_type


class BillableResources:
    """
    Result of a cost estimation
    """

    def __init__(self, processing_units: float, storage_gb: float):
        """
        Constructor

        :param processing_units: estimated cost of a job
        :param storage_gb: estimated output size of a job in GB
        """
        self._units = processing_units
        self._gb = storage_gb

    def processing_units(self) -> float:
        """
        Estimated cost in processing units of a job

        :return: Processing units
        """
        return self._units

    def storage_gb(self) -> float:
        """
        Estimated output size of a job

        :return: Storage size in GB
        """
        return self._gb

    def __str__(self):
        return f"{self.processing_units()} units, {self.storage_gb()}GB"


class AccessInfo:
    """
    Comprehensive access information of a user to ContextCapture API
    """
    def __init__(self, has_access: bool, status: AccessStatus):
        """
        Constructor
        :param has_access: Specify if the user can access the service
        :param status: Detailed level of access
        """
        self._access = has_access
        self._status = status

    def has_access(self) -> bool:
        """
        True if the user has access and can use the service
        :return: Access
        """
        return self._access

    def status(self) -> AccessStatus:
        """
        Detailed access status
        :return: Access status
        """
        return self._status

    def __str__(self):
        if self.has_access():
            return f"Access authorized, status {self.status()}"
        return f"Access unauthorized, status {self.status()}"
