import reality_capture.specifications.training as training

training_s3d_inputs = training.TrainingS3DInputs(
    segmentations3D=["401975b7-0c0a-4498-5896-84987921f4bb"],
    detectorName="example-detector",
)

training_s3d_outputs = [
    training.TrainingS3DOutputsCreate.DETECTOR,
]

training_s3ds = training.TrainingS3DSpecificationsCreate(
    inputs=training_s3d_inputs, outputs=training_s3d_outputs
)
