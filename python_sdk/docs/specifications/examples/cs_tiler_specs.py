from reality_capture.specifications.cs_tiler import (ContextSceneTilerSpecificationsCreate, CSTilerInputs,
                                                     CSTilerOptions, CSObject)

inputs = CSTilerInputs(scene="dbad181b-5079-4224-8561-96ad218bcfc9")
options = CSTilerOptions(objectToTile=CSObject.CAMERAS)

specs = ContextSceneTilerSpecificationsCreate(inputs=inputs, options=options)
