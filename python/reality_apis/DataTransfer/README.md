# Upload context scenes and orientations

In order to get consistent context scenes and orientations on Context Share, you have to upload the data referenced in those files first. Indeed, context scenes and orientations contain local paths to image collections, point clouds, etc. However, when the context scene is uploaded, these paths are not valid anymore. To have a working context scene or ccorientation when uploading from your local machine, you have to:

**Upload references first.** When uploading an image folder, images should be at the root of this folder, and at the same level (no sub folders). The same thing applies to orientations, files should be uploaded **before** you upload the ccorientation file.

**Change the references.** You can do that by hand by saving the ids of the files you uploaded to the cloud, opening your context scene or ccorientation file in a text editor and changing the paths to those ids. You can also use the `ReferenceTable` object to save paths and ids while uploading reality data and the `upload_context_scene` or `upload_ccorientation` functions to replace paths automatically before uploading those types of files.  
