import reality_capture.specifications.conversion as conversion

conversion_inputs = conversion.ConversionInputs(las=["401975b7-0c0a-4498-5896-84987921f4bb"])
conversion_outputs = [conversion.ConversionOutputsCreate.OPC]
conversion_options = conversion.ConversionOptions()
conversions = conversion.ConversionSpecificationsCreate(inputs=conversion_inputs, outputs=conversion_outputs,
                                                        options=conversion_options)
