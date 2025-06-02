import reality_capture.specifications.touchup as touchup

tue_inputs = touchup.TouchUpExportInputs(modelingReference="18eaa53c-0f8c-45bd-9040-f2e8339b30d4",
                                         tilesToTouchUp=["Tile_1"])
tue_outputs = [touchup.TouchUpExportOutputsCreate.TOUCH_UP_DATA]
tue_options = touchup.TouchUpExportOptions(format=touchup.TouchFormat.OBJ, level=touchup.TouchLevel.GEOMETRY)
tues = touchup.TouchUpExportSpecificationsCreate(inputs=tue_inputs, outputs=tue_outputs, options=tue_options)

