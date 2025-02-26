import reality_capture.specifications.import_features as import_features

import_features_inputs = import_features.ImportFeaturesInputs(geojson=["401975b7-0c0a-4498-5896-84987921f4bb"])
import_features_outputs = [import_features.ImportFeaturesOutputsCreate.FDB]
import_features_options = import_features.ImportFeaturesOptions()
import_features_specs = import_features.ImportFeaturesSpecificationsCreate(inputs=import_features_inputs,
                                                                           outputs=import_features_outputs,
                                                                           options=import_features_options)
