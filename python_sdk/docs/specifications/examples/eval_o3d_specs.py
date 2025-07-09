import reality_capture.specifications.eval_o3d as eval_o3d

eval_o3d_inputs = eval_o3d.EvalO3DInputs(reference="587a14fd-305a-474c-b037-26d4ee8829d9",
                                         prediction="08342927-859c-4563-a4b8-6c6cfb7d5bb3")
eval_o3d_outputs = [eval_o3d.EvalO3DOutputsCreate.OBJECTS3D, eval_o3d.EvalO3DOutputsCreate.REPORT]
eval_o3d_options = eval_o3d.EvalO3DOptions()
eval_o3ds = eval_o3d.EvalO3DSpecificationsCreate(inputs=eval_o3d_inputs, outputs=eval_o3d_outputs,
                                                 options=eval_o3d_options)
