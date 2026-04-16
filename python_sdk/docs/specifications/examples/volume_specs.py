import reality_capture.specifications.volume as volume

volume_inputs = volume.VolumeInputs(model3d="084985b0-71b5-4b02-a788-db261dd0730c",
                                    regionOfInterest="bkt:region_of_interest.json")
volume_outputs = [volume.VolumeOutputsCreate.VOLUME]
volume_specs = volume.VolumeSpecificationsCreate(inputs=volume_inputs, outputs=volume_outputs)
