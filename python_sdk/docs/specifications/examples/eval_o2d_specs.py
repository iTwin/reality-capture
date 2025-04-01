import reality_capture.specifications.eval_o2d as eval_o2d

eval_o2d_inputs = eval_o2d.EvalO2DInputs(reference="587a14fd-305a-474c-b037-26d4ee8829d9",
                                         prediction="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
eval_o2d_outputs = [eval_o2d.EvalO2DOutputsCreate.OBJECTS2D, eval_o2d.EvalO2DOutputsCreate.REPORT]
eval_o2d_options = eval_o2d.EvalO2DOptions()
eval_o2ds = eval_o2d.EvalO2DSpecificationsCreate(inputs=eval_o2d_inputs, outputs=eval_o2d_outputs,
                                                 options=eval_o2d_options)
