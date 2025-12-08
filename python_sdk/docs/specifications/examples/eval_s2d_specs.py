import reality_capture.specifications.eval_s2d as eval_s2d

eval_s2d_inputs = eval_s2d.EvalS2DInputs(reference="587a14fd-305a-474c-b037-26d4ee8829d9",
                                         prediction="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
eval_s2d_outputs = [eval_s2d.EvalS2DOutputsCreate.SEGMENTATION2D, eval_s2d.EvalS2DOutputsCreate.SEGMENTED_PHOTOS,
                    eval_s2d.EvalS2DOutputsCreate.REPORT]
eval_s2ds = eval_s2d.EvalS2DSpecificationsCreate(inputs=eval_s2d_inputs, outputs=eval_s2d_outputs)
