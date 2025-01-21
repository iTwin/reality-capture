import reality_capture.specifications.calibration as calib

cs = calib.CalibrationSpecificationsCreate()
cs.inputs.scene = "2823ede8-3947-4704-8a51-a0ef638f3e1c"
cs.outputs = [calib.CalibrationOutputsCreate.SCENE, calib.CalibrationOutputsCreate.REPORT]
