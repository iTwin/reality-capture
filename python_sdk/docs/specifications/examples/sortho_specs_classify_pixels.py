import reality_capture.specifications.segmentation_orthophoto as segmentation_orthophoto

sortho_inputs = segmentation_orthophoto.SegmentationOrthophotoInputs(
    orthophoto="587a14fd-305a-474c-b037-26d4ee8829d9",
    orthophotoSegmentationDetector="63376f37-6ud5-466b-b361-9fc3623125f8")
sortho_outputs = [segmentation_orthophoto.SegmentationOrthophotoOutputsCreate.SEGMENTATION2D,
                  segmentation_orthophoto.SegmentationOrthophotoOutputsCreate.SEGMENTED_PHOTOS]
sorthos = segmentation_orthophoto.SegmentationOrthophotoSpecificationsCreate(inputs=sortho_inputs,
                                                                             outputs=sortho_outputs)
