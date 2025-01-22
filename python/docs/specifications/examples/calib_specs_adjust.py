import reality_capture.specifications.calibration as calib

cs_inputs = calib.CalibrationInputs(scene="2823ede8-3947-4704-8a51-a0ef638f3e1c")
cs_outputs = [calib.CalibrationOutputsCreate.SCENE, calib.CalibrationOutputsCreate.REPORT]
cs_options = calib.CalibrationOptions(centerPolicy=calib.CenterPolicy.ADJUST,
                                      rotationPolicy=calib.RotationPolicy.ADJUST)
cs = calib.CalibrationSpecificationsCreate(inputs=cs_inputs, outputs=cs_outputs, options=cs_options)
