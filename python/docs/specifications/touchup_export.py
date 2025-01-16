import reality_capture.specifications.touchup as touchup

tues = touchup.TouchUpExportSpecificationsCreate()
tues.inputs.reference_model = "18eaa53c-0f8c-45bd-9040-f2e8339b30d4"
tues.inputs.tiles_to_touch_up = ["Tile_1"]
tues.outputs = [touchup.TouchUpExportOutputsCreate.TOUCH_UP_DATA]
tues.options.format = touchup.TouchFormat.OBJ
tues.options.level = touchup.TouchLevel.GEOMETRY
