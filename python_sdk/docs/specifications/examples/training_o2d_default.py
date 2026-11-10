import reality_capture.specifications.training as training

training_o2d_inputs = training.TrainingO2DInputs(
    scenes=["401975b7-0c0a-4498-5896-84987921f4bb"],
    detectorName="example-detector",
)

training_o2d_outputs = [
    training.TrainingO2DOutputsCreate.DETECTOR,
]

training_o2d_specs = training.TrainingO2DSpecificationsCreate(
    inputs=training_o2d_inputs, outputs=training_o2d_outputs
)
