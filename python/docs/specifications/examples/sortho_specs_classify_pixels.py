import reality_capture.specifications.segmentation_orthophoto as segmentation_orthophoto

sortho = segmentation_orthophoto.SegmentationOrthophotoSpecificationsCreate()
sortho.inputs.photos = "587a14fd-305a-474c-b037-26d4ee8829d9"
sortho.inputs.objects2d = "63376f37-6ud5-466b-b361-9fc3623125f8"
sortho.outputs = [segmentation_orthophoto.SegmentationOrthophotoOutputsCreate.SEGMENTED_PHOTOS,
                  segmentation_orthophoto.SegmentationOrthophotoOutputsCreate.SEGMENTATION2D]
