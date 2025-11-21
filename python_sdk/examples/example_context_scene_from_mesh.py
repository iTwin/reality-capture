# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import json
from contextscene.ContextScene import ContextScene
from contextscene.ContextScene import ReferencesCS
from contextscene.ContextScene import RefPath
from contextscene.ContextScene import Meshes
from contextscene.ContextScene import Mesh
from contextscene.ContextScene import SpatialReferenceSystems
from contextscene.ContextScene import MeshCollection

'''
Create a json Contextscene base on a folder with a mesh inside

input folder is the path where the mesh is stored.
output folder is where to save the created context scene
'''

INPUT_FOLDER = "C:/Path/to/mesh/folder"
OUTPUT_FOLDER = "C:/Path/to/output"
FORMAT_3D = ["opc", "OPC", "3SM", "3sm", "3MX", "3mx"]


def main():
    # Initialize empty ContextScene
    context_scene = ContextScene()
    # Initialize empty Reference dictionary
    reference_dict = ReferencesCS()
    meshes = Meshes()

    # Create references dictionary
    tmp_ref = dict()
    for (root, dirs, files) in os.walk(INPUT_FOLDER, topdown=True):
        if any(files) and (dirs not in list(reference_dict.ref.keys())):
            for _ in files:
                if _[-3:] in FORMAT_3D:
                    tmp_ref[root] = len(reference_dict.ref.keys())
                    rp = RefPath(len(reference_dict.ref.keys()), root)
                    reference_dict.add_ref(rp)

    # Creat mesh dictionary
    for (root, dirs, files) in os.walk(INPUT_FOLDER, topdown=True):
        if any(files):
            for _ in files:
                srs_3mx = SpatialReferenceSystems()
                if _[-3:] in FORMAT_3D:
                    mesh_name = _[:-4]
                    meshes.add_mesh(Mesh(len(meshes.meshes.keys()), mesh_name, f"{tmp_ref[root]}:{_}"))
                    if _[-3:] == "3mx":
                        with open(os.path.join(root, _)) as json_file:
                            data_3mx = json.load(json_file)
                            srs_3mx.set_id(len(srs_3mx.srs))
                            srs_3mx.add_srs(len(srs_3mx.srs), data_3mx["layers"][0]["SRS"])
                meshCollection = MeshCollection(meshes.meshes)
                meshCollection.set_srs(srs_3mx.id)

    # Creation of the full context scene
    context_scene.set_spatial_reference_system(srs_3mx.srs)
    context_scene.set_mesh_collection(meshCollection.mesh_coll)
    context_scene.set_references(reference_dict)
    context_scene.save_json_contextscene(OUTPUT_FOLDER)


if __name__ == '__main__':
    main()
