from reality_capture.service.job import Job
from reality_capture.specifications.calibration import CalibrationSpecifications
from reality_capture.specifications.change_detection import ChangeDetectionSpecifications
from reality_capture.specifications.constraints import ConstraintsSpecifications
from reality_capture.specifications.eval_o2d import EvalO2DSpecifications
from reality_capture.specifications.eval_o3d import EvalO3DSpecifications
from reality_capture.specifications.eval_s2d import EvalS2DSpecifications
from reality_capture.specifications.eval_s3d import EvalS3DSpecifications
from reality_capture.specifications.eval_sortho import EvalSOrthoSpecifications
from reality_capture.specifications.fill_image_properties import FillImagePropertiesSpecifications
from reality_capture.specifications.gaussian_splats import GaussianSplatsSpecifications
from reality_capture.specifications.import_point_cloud import ImportPCSpecifications
from reality_capture.specifications.objects2d import Objects2DSpecifications
from reality_capture.specifications.production import ProductionSpecifications
from reality_capture.specifications.reconstruction import ReconstructionSpecifications
from reality_capture.specifications.segmentation2d import Segmentation2DSpecifications
from reality_capture.specifications.segmentation3d import Segmentation3DSpecifications
from reality_capture.specifications.segmentation_orthophoto import SegmentationOrthophotoSpecifications
from reality_capture.specifications.tiling import TilingSpecifications
from reality_capture.specifications.touchup import TouchUpImportSpecifications, TouchUpExportSpecifications
from reality_capture.specifications.water_constraints import WaterConstraintsSpecifications
from reality_capture.specifications.clearance import ClearanceSpecifications

class TestJobValidator:
    j_base = {
        "id": "uuid",
        "name": "test",
        "iTwinId": "uuidit",
        "state": "Active",
        "executionInfo": {
            "createdDateTime": "2025-01-19T14:30:00Z"
        },
        "userId": "myuser"
    }

    def test_validation_fip(self):
        j = self.j_base.copy()
        j["type"] = "FillImageProperties"
        j["specifications"] = {
            "inputs": {
                "imageCollections": ["ic_id"]
            },
            "outputs": {
                "scene": "sceneid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, FillImagePropertiesSpecifications)

    def test_validation_calibration(self):
        j = self.j_base.copy()
        j["type"] = "Calibration"
        j["specifications"] = {
            "inputs": {
                "scene": "scene_id"
            },
            "outputs": {
                "scene": "sceneid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, CalibrationSpecifications)

    def test_validation_change_detection(self):
        j = self.j_base.copy()
        j["type"] = "ChangeDetection"
        j["specifications"] = {
            "inputs": {
                "model3dA": "modela",
                "model3dB": "modelb"
            },
            "outputs": {
                "changesInModelA": "rdid",
                "objects3d": "obj"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, ChangeDetectionSpecifications)

    def test_validation_constraints(self):
        j = self.j_base.copy()
        j["type"] = "Constraints"
        j["specifications"] = {
            "inputs": {
                "modelingReference": "mfid",
                "constraints_to_delete": ["4161f47e-24b4-4f97-802e-d68b71bdcb65"]
            },
            "outputs": {
                "addedConstraintsInfo": "bkt:youpi/t.json"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, ConstraintsSpecifications)

    def test_validation_eval_o2d(self):
        j = self.j_base.copy()
        j["type"] = "EvalO2D"
        j["specifications"] = {
            "inputs": {
                "reference": "mfid",
                "prediction": "predid"
            },
            "outputs": {
                "objects2d": "objid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, EvalO2DSpecifications)

    def test_validation_eval_o3d(self):
        j = self.j_base.copy()
        j["type"] = "EvalO3D"
        j["specifications"] = {
            "inputs": {
                "reference": "mfid",
                "prediction": "predid"
            },
            "outputs": {
                "objects3d": "objid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, EvalO3DSpecifications)

    def test_validation_eval_s2d(self):
        j = self.j_base.copy()
        j["type"] = "EvalS2D"
        j["specifications"] = {
            "inputs": {
                "reference": "mfid",
                "prediction": "predid"
            },
            "outputs": {
                "segmentation2d": "sid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, EvalS2DSpecifications)

    def test_validation_eval_s3d(self):
        j = self.j_base.copy()
        j["type"] = "EvalS3D"
        j["specifications"] = {
            "inputs": {
                "reference": "mfid",
                "prediction": "predid"
            },
            "outputs": {
                "segmentation3d": "sid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, EvalS3DSpecifications)

    def test_validation_eval_sortho(self):
        j = self.j_base.copy()
        j["type"] = "EvalSOrtho"
        j["specifications"] = {
            "inputs": {
                "reference": "mfid",
                "prediction": "predid"
            },
            "outputs": {
                "segmentation2d": "sid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, EvalSOrthoSpecifications)

    def test_validation_gs(self):
        j = self.j_base.copy()
        j["type"] = "GaussianSplats"
        j["specifications"] = {
            "inputs": {
                "scene": "mfid"
            },
            "outputs": {
                "splats": "sid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, GaussianSplatsSpecifications)

    def test_validation_ipc(self):
        j = self.j_base.copy()
        j["type"] = "ImportPointCloud"
        j["specifications"] = {
            "inputs": {
                "scene": "mfid"
            },
            "outputs": {
                "scene": "sid",
                "scanCollection": "sid2"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, ImportPCSpecifications)

    def test_validation_o2d(self):
        j = self.j_base.copy()
        j["type"] = "Objects2D"
        j["specifications"] = {
            "inputs": {
                "photos": "mfid"
            },
            "outputs": {
                "objects2d": "sid"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, Objects2DSpecifications)

    def test_validation_prod(self):
        j = self.j_base.copy()
        j["type"] = "Production"
        j["specifications"] = {
            "inputs": {
                "scene": "mfid",
                "modelingReference": "rmid"
            },
            "outputs": {
                "exports": [{"location": "eid", "format": "LAS"}]
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, ProductionSpecifications)

    def test_validation_recons(self):
        j = self.j_base.copy()
        j["type"] = "Reconstruction"
        j["specifications"] = {
            "inputs": {
                "scene": "mfid",
            },
            "outputs": {
                "exports": [{"location": "eid", "format": "LAS"}]
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, ReconstructionSpecifications)

    def test_validation_s2d(self):
        j = self.j_base.copy()
        j["type"] = "Segmentation2D"
        j["specifications"] = {
            "inputs": {
                "photos": "mfid",
            },
            "outputs": {
                "segmentation2d": "s2did"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, Segmentation2DSpecifications)

    def test_validation_s3d(self):
        j = self.j_base.copy()
        j["type"] = "Segmentation3D"
        j["specifications"] = {
            "inputs": {
                "model3d": "mfid",
            },
            "outputs": {
                "segmentation3D": "s3did"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, Segmentation3DSpecifications)

    def test_validation_sortho(self):
        j = self.j_base.copy()
        j["type"] = "SegmentationOrthophoto"
        j["specifications"] = {
            "inputs": {
                "orthophoto": "mfid",
                "orthophotoSegmentationDetector": "detector"
            },
            "outputs": {
                "segmentation2d": "s2did"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, SegmentationOrthophotoSpecifications)

    def test_validation_tiling(self):
        j = self.j_base.copy()
        j["type"] = "Tiling"
        j["specifications"] = {
            "inputs": {
                "scene": "mfid"
            },
            "outputs": {
                "modelingReference": {
                    "location": "rmid"
                }
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, TilingSpecifications)

    def test_validation_tui(self):
        j = self.j_base.copy()
        j["type"] = "TouchUpImport"
        j["specifications"] = {
            "inputs": {
                "modelingReference": "mfid",
                "touchUpData": "tud"
            },
            "outputs": {
                "importInfo": "bkt:tui.json"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, TouchUpImportSpecifications)

    def test_validation_tue(self):
        j = self.j_base.copy()
        j["type"] = "TouchUpExport"
        j["specifications"] = {
            "inputs": {
                "modelingReference": "mfid"
            },
            "outputs": {
                "touchUpData": "data"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, TouchUpExportSpecifications)

    def test_validation_wc(self):
        j = self.j_base.copy()
        j["type"] = "WaterConstraints"
        j["specifications"] = {
            "inputs": {
                "modelingReference": "mfid",
                "scene": "sid"
            },
            "outputs": {
                "constraints": "bkt:constraints"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, WaterConstraintsSpecifications)

    def test_validation_clearance(self):
        j = self.j_base.copy()
        j["type"] = "ClearanceCalculation"
        j["specifications"] = {
            "inputs": {
                "model3d": "mfid",
                "clearanceFootprint": "sid"
            },
            "outputs": {
                "ovfPoints": "rdId"
            }
        }
        job = Job(**j)
        assert isinstance(job.specifications, ClearanceSpecifications)
