import reality_capture.specifications.eval_s3d as eval_s3d

eval_s3d_inputs = eval_s3d.EvalS3DInputs(reference="587a14fd-305a-474c-b037-26d4ee8829d9",
                                         prediction="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
eval_s3d_outputs = [eval_s3d.EvalS3DOutputsCreate.SEGMENTATION3D, eval_s3d.EvalS3DOutputsCreate.SEGMENTED_POINT_CLOUD,
                    eval_s3d.EvalS3DOutputsCreate.REPORT]
eval_s3ds = eval_s3d.EvalS3DSpecificationsCreate(inputs=eval_s3d_inputs, outputs=eval_s3d_outputs)
