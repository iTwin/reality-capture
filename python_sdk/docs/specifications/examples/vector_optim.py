from reality_capture.specifications.vector_optimization import (VectorOptimizationSpecificationsCreate,
                                                                VectorOptimizationInputs, VectorOptimizationOptions,
                                                                VectorOptimizationFormat)

inputs = VectorOptimizationInputs(vectors=["dbad181b-5079-4224-8561-96ad218bcfc9",
                                           "ea881e3e-b0e3-4b23-bc3f-4ee8e9acdf61"])
options = VectorOptimizationOptions(format=VectorOptimizationFormat.FEATURE_DB, featureClassDisplayName="Road")

specs = VectorOptimizationSpecificationsCreate(inputs=inputs, options=options)
