**Context Scenes** 
===============

A ContextScene is a metadata file designed to manipulate raw reality data 
like photos, maps, meshes and point cloud. It also stores extra metadata on 
these reality data, like photo position, detected objects, etc.

A ContextScene is persisted as a Json file that will be named *ContextScene.json*

You will find here the python structure for context scene creation. 
Only the following information have been implemented so far :
- Spatial reference system
- Photo collection
- Point cloud collection
- Mesh collection
- Annotations
  - 2D segmentation
  - 2D objects

In examples folder you will be able to find examples on the way to create 
a context scene from a picture folder, with segmented mask or not,
or a mesh folder.


