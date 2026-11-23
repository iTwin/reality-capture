import reality_capture.specifications.change_detection as change_detection

cd_inputs = change_detection.ChangeDetectionInputs(model3DA="d7ed510b-b83c-4da7-931a-679c6a754e82",
                                                   model3DB="301f0cd6-7890-4003-a49f-43cfcaaf98a6",
                                                   pointCloudChangeDetector="example-change-detector/1.0")
cd_outputs = [
    change_detection.ChangeDetectionOutputsCreate.SEGMENTATION3D_A,
    change_detection.ChangeDetectionOutputsCreate.SEGMENTED_MODEL3D_A,
    change_detection.ChangeDetectionOutputsCreate.SEGMENTATION3D_B,
    change_detection.ChangeDetectionOutputsCreate.SEGMENTED_MODEL3D_B,
]
cds = change_detection.ChangeDetectionSpecificationsCreate(inputs=cd_inputs, outputs=cd_outputs)
