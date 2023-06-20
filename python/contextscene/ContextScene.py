# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import json

'''
Python structure for basic context scene creation
'''


class ContextScene:

    def __init__(self, version="5.0"):
        self.version = version
        self.mesh_collection = None
        self.point_cloud_collection = None
        self.annotations = None
        self.spatial_reference_system = None
        self.photo_collection = None
        self.references = None
        self.segmentation2D = None

    def set_version(self, version):
        self.version = version

    def set_mesh_collection(self, mesh_collection):
        self.mesh_collection = mesh_collection

    def set_point_cloud_collection(self, point_cloud_collection):
        self.point_cloud_collection = point_cloud_collection

    def set_annotations(self, annotations):
        self.annotations = annotations

    def set_spatial_reference_system(self, spatial_reference_system):
        self.spatial_reference_system = spatial_reference_system

    def set_photo_collection(self, photo_collection):
        self.photo_collection = photo_collection

    def set_references(self, references):
        self.references = references

    def cs_to_dict(self):
        result = dict()
        result["version"] = self.version
        if self.spatial_reference_system:
            result["SpatialReferenceSystems"] = self.spatial_reference_system
        if self.photo_collection:
            result["PhotoCollection"] = self.photo_collection.photoCS
        if self.mesh_collection:
            result["MeshCollection"] = self.mesh_collection
        if self.point_cloud_collection:
            result["PointCloudCollection"] = self.point_cloud_collection
        if self.annotations:
            result["Annotations"] = self.annotations
        if self.references:
            result["References"] = self.references.ref
        return result

    def save_json_contextscene(self, output_path):
        context_scene = os.path.join(output_path, "ContextScene.json")
        context_dict = self.cs_to_dict()
        with open(context_scene, 'w', encoding='utf8') as json_file_handler:
            json_file_handler.write(json.dumps(context_dict, indent=4))

    # Read existing context scene and create ContextScene object
    def open_context_scene(path):
        opened_cs = ContextScene()

        with open(path, 'r', encoding='utf8') as data:
            cs = json.load(data)

        if "version" in cs.keys():
            opened_cs.set_version(cs["version"])
        else:
            print("Version number missing")
        if "SpatialReferenceSystems" in cs.keys():
            srs = SpatialReferenceSystems()
            for k, v in cs["SpatialReferenceSystems"].items():
                srs.add_srs(k, v["Definition"])
            opened_cs.set_spatial_reference_system(srs.srs)
        else:
            print("No spatial reference systems in the context scene")
        if "PhotoCollection" in cs.keys():
            photo_coll = PhotoCollectionCS()
            if "Photos" in cs["PhotoCollection"].keys():
                photocs = PhotosCS()
                for k, v in cs["PhotoCollection"]["Photos"].items():
                    photocs.add_photo(ImagePath(k, v["ImagePath"]))
            photo_coll.add_photo(photocs)
            opened_cs.set_photo_collection(photo_coll)
        else:
            print("No photo collection in the context scene")
        if "Annotations" in cs.keys():
            annotation = Annotations()
            if 'Labels' in cs["Annotations"].keys():
                labels = Labels()
                for k, v in cs["Annotations"]["Labels"].items():
                    label = Labels_param()
                    label.set_id_name(k, v["Name"])
                    if "Line" in v.keys():
                        label.set_line(v["Line"])
                    if "Contour" in v.keys():
                        label.set_contour(v["Contour"])
                    if "Object" in v.keys():
                        label.set_object(v["Object"])
                    labels.add_labels(label)
                annotation.set_labels(labels.labels)
            else:
                print("No labels in the context scene")
            if 'Segmentation2D' in cs["Annotations"].keys():
                segmentation2D = Segmentation2D()
                for k, v in cs["Annotations"]["Segmentation2D"].items():
                    segmentation2D.add_photo(RefPath(k, v["Path"]))
                annotation.set_segmentation2D(segmentation2D.segmentation2D)
            else:
                print("No segmentation in the context scene")
            if 'Objects2D' in cs["Annotations"].keys():
                objects2D = Objects2D()
                for i, o in cs["Annotations"]["Objects2D"].items():
                    object_list = Objects2D_list()
                    for k, v in o.items():
                        if ("LabelInfo" and "Box2D") in v.keys():
                            label_inf = LabelInfo(v["LabelInfo"]["Confidence"], v["LabelInfo"]["LabelId"])
                            box = Box2D(v["Box2D"]['xmin'], v["Box2D"]['ymin'], v["Box2D"]['xmax'], v["Box2D"]['ymax'])
                            object_list.add_object(k, label_inf.get_labelInfo() , box.get_box2D())
                    objects2D.add_object(i, object_list)
                annotation.set_objects2D(objects2D.objects2D)
            else:
                print("No detected objects in the context scene")

            opened_cs.set_annotations(annotation.annotationCS)
        else:
            print("No annotation in the context scene")
        if "PointCloudCollection" in cs.keys():
            srs = cs["PointCloudCollection"]["SRSId"]
            pointCloudList = PointClouds()
            for k, v in cs["PointCloudCollection"]["PointClouds"].items():
                pc = PointCloud(k, v["Name"], v["BoundingBox"], v["Path"])
                pointCloudList.add_pc(pc)
            pointCloudCollection = PointCloudCollection( pointCloudList.pointclouds)
            pointCloudCollection.set_srs(srs)
            opened_cs.set_point_cloud_collection(pointCloudCollection.pc_coll)
        else:
            print("No point cloud collection in the context scene")
        if "MeshCollection" in cs.keys():
            srs = cs["MeshCollection"]["SRSId"]
            meshList = Meshes()
            for k, v in cs["MeshCollection"]["Meshes"].items():
                mesh = Mesh(k, v["Name"], v["Path"])
                meshList.add_mesh(mesh)
            meshCollection = MeshCollection(meshList.meshes)
            meshCollection.set_srs(srs)
            opened_cs.set_mesh_collection(meshCollection.mesh_coll)
        else:
            print("No mesh collection in the context scene")
        if "References" in cs.keys():
            referencesCS = ReferencesCS()
            for k, v in cs["References"].items():
                referencesCS.add_ref(RefPath(k, v["Path"]))
            opened_cs.set_references(referencesCS)
        else:
            print("References are missing in the context scene")
        return opened_cs


class RefPath:
    def __init__(self, _id, path):
        self.id = _id
        self.path = {"Path": path}


class ImagePath:
    def __init__(self, _id, path):
        self.id = _id
        self.path = {"ImagePath": path}


class ReferencesCS:
    def __init__(self):
        self.ref = dict()

    def add_ref(self, id_path):
        self.ref[id_path.id] = id_path.path


class PhotosCS:
    def __init__(self):
        self.photo = dict()

    def add_photo(self, id_path):
        self.photo[id_path.id] = id_path.path


class PhotoCollectionCS:
    def __init__(self):
        self.photoCS = dict()

    def add_photo(self, photo_cs):
        self.photoCS["Photos"] = photo_cs.photo


class Labels_param:
    def __init__(self):
        self.id = None
        self.name = None
        self.line = False
        self.contour = False
        self.object = False

    def set_id_name(self, label_id, name):
        self.id = label_id
        self.name = name

    def set_line(self, line):
        self.line = line

    def set_contour(self, contour):
        self.contour = contour

    def set_object(self, object):
        self.object = object


class Labels:
    def __init__(self):
        self.labels = dict()

    def add_labels(self, label):
        label_param = {"Name": label.name}
        if label.line:
            label_param["Line"] = label.line
        if label.contour:
            label_param["Contour"] = label.contour
        if label.object:
            label_param["Object"] = label.object
        self.labels[label.id] = label_param


class Segmentation2D:
    def __init__(self):
        self.segmentation2D = dict()

    def add_photo(self, RefPath):
        self.segmentation2D[RefPath.id] = RefPath.path


class Annotations:
    def __init__(self):
        self.annotationCS = dict()

    def set_labels(self, label):
        self.annotationCS["Labels"] = label

    def set_segmentation2D(self, segmentation2D):
        self.annotationCS["Segmentation2D"] = segmentation2D

    def set_objects2D(self, objects2D):
        self.annotationCS["Objects2D"] = objects2D


class LabelInfo:
    def __init__(self, confidence, labelid):
        self.confidence = confidence
        self.labelID = labelid

    def get_labelInfo(self):
        return {"Confidence": self.confidence, "LabelId": self.labelID}


class Box2D:
    def __init__(self, xmin, ymin, xmax, ymax):
        self.xmin = xmin
        self.ymin = ymin
        self.xmax = xmax
        self.ymax = ymax

    def get_box2D(self):
        return {"xmin": self.xmin, "ymin": self.ymin, "xmax": self.xmax, "ymax": self.ymax}


class Objects2D_list:
    def __init__(self):
        self.list_objects2D = dict()

    def add_object(self, object_id, label_info, box2D):
        self.list_objects2D[object_id] = {"LabelInfo": label_info, "Box2D": box2D}


class Objects2D:
    def __init__(self):
        self.objects2D = dict()

    def add_object(self, object_list_id, object_list):
        self.objects2D[object_list_id] = object_list.list_objects2D


class SpatialReferenceSystems:
    def __init__(self):
        self.srs = dict()
        self.id = None

    def set_id(self, srs_id):
        self.id = srs_id

    def add_srs(self, srs_id, srs):
        self.srs[srs_id] = {"Definition": srs}


class BoundingBox:
    def __init__(self, xmin, ymin, zmin, xmax, ymax, zmax):
        self.xmin = xmin
        self.ymin = ymin
        self.zmin = zmin
        self.xmax = xmax
        self.ymax = ymax
        self.zmax = zmax

    def get_bounding_box(self):
        return {"xmin": self.xmin, "ymin": self.ymin, "zmin": self.zmin, "xmax": self.xmax, "ymax": self.ymax,
                "zmax": self.zmax}


class PointCloud:
    def __init__(self, pc_id, name, bounding_box, path):
        self.id = pc_id
        self.pc = {"Name": name, "BoundingBox": bounding_box, "Path": path}


class PointClouds:
    def __init__(self):
        self.pointclouds = dict()

    def add_pc(self, pc):
        self.pointclouds[pc.id] = pc.pc


class PointCloudCollection:
    def __init__(self, pc):
        self.pc_coll = {"PointClouds": pc}

    def set_srs(self, pc_id):
        self.pc_coll["SRSId"] = pc_id


class Mesh:
    def __init__(self, pc_id, name, path):
        self.id = pc_id
        self.mesh = {"Name": name, "Path": path}


class Meshes:
    def __init__(self):
        self.meshes = dict()

    def add_mesh(self, mesh):
        self.meshes[mesh.id] = mesh.mesh


class MeshCollection:
    def __init__(self, pc):
        self.mesh_coll = {"Meshes": pc}

    def set_srs(self, mesh_id):
        self.mesh_coll["SRSId"] = mesh_id



