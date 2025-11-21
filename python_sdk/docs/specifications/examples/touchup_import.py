import reality_capture.specifications.touchup as touchup

tui_inputs = touchup.TouchUpImportInputs(modelingReference="18eaa53c-0f8c-45bd-9040-f2e8339b30d4",
                                         touchUpData="b11f6319-82a9-4669-b783-9889978c5b4e")
out = touchup.TouchUpImportOutputsCreate.IMPORT_INFO
tuis = touchup.TouchUpImportSpecificationsCreate(inputs=tui_inputs, outputs=[out])
