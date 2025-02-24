import reality_capture.specifications.calibration as calib

calib_inputs = calib.CalibrationInputs(scene="2823ede8-3947-4704-8a51-a0ef638f3e1c")
calib_outputs = [calib.CalibrationOutputsCreate.CONTEXT_SCENE, calib.CalibrationOutputsCreate.REPORT]
calib_options = calib.CalibrationOptions()
calib_specs = calib.CalibrationSpecificationsCreate(inputs=calib_inputs, outputs=calib_outputs, options=calib_options)
