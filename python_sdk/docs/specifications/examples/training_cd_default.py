import reality_capture.specifications.training as training

training_cd_inputs = training.TrainingChangeDetectionInputs(
    segmentation3DPairs=[
        training.Segmentation3DPair(segmentation3DA="391cd7ff-7020-474b-bb7d-e6e4581645c2",
                                    segmentation3DB="ea35a795-5807-4459-9e8e-52bc5140da88"),
        training.Segmentation3DPair(segmentation3DA="8d598729-8e85-4eac-9a2c-ace52245bab6",
                                    segmentation3DB="4a7a69be-ba90-4bd0-9993-94aad3a1d9e6"),
    ],
    detectorName="example-change-detector",
)

training_cd_outputs = [
    training.TrainingChangeDetectionOutputsCreate.DETECTOR,
]

training_cds = training.TrainingChangeDetectionSpecificationsCreate(
    inputs=training_cd_inputs, outputs=training_cd_outputs
)
