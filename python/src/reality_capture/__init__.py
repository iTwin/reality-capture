"""import reality_capture.service.error
import reality_capture.service.job
import reality_capture.service.response
import reality_capture.service.service
import reality_capture.specifications.calibration
import reality_capture.specifications.change_detection
import reality_capture.specifications.constraints
import reality_capture.specifications.extract_ground
import reality_capture.specifications.fill_image_properties
import reality_capture.specifications.geometry
import reality_capture.specifications.import_point_cloud
import reality_capture.specifications.objects2d
import reality_capture.specifications.production
import reality_capture.specifications.reconstruction
import reality_capture.specifications.segmentation2d
import reality_capture.specifications.segmentation3d
import reality_capture.specifications.segmentation_orthophoto
import reality_capture.specifications.tiling
import reality_capture.specifications.touchup
import reality_capture.specifications.water_constraints"""

from importlib import metadata

try:
    __version__ = metadata.version(__package__)
except metadata.PackageNotFoundError as e:
    __version__ = "0.0.0-clone"
