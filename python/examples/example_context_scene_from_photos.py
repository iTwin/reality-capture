# Copyright (c) Bentley Systems, Incorporated. All rights reserved.
# See LICENSE.md in the project root for license terms and full copyright notice.

import os
import json
from contextscene.ContextScene import ContextScene
from contextscene.ContextScene import ReferencesCS
from contextscene.ContextScene import PhotosCS
from contextscene.ContextScene import PhotoCollectionCS
from contextscene.ContextScene import RefPath
from contextscene.ContextScene import ImagePath
from contextscene.ContextScene import Annotations
from contextscene.ContextScene import Segmentation2D
from contextscene.ContextScene import Labels

'''
Create a json Contextscene base on a folder with picture

input folder is the path where the picture are stored. It could be a folder containing folder with pictures
output folder is where to save the created context scene
segmentation folder, needed if SEGMENTED_CONTEXT_SCENE is true. It is the location of you 16bits png mask
labels file is a json file containing references to the classes of the segmented masks

Example of label file :
{
    "0" : {
        "Name" : "background"
    },
    "1" : {
        "Name" : "crack"
    }
}
'''

ANNOTATIONS = False
SEGMENTED_CONTEXT_SCENE = False
INPUT_FOLDER = "C:/Path/to/images/folder"
SEGMENTATION_FOLDER = "C:/Path/to/masks"
LABEL_FILE = "C:/Path/to/label_file"
OUTPUT_FOLDER = "C:/Path/to/output"
PICTURE_FORMAT = ["jpg", "JPG", "png", "PNG"]

def main():
    # Initialize empty ContextScene
    context_scene = ContextScene()
    # Initialize empty Reference dictionary
    reference_dict = ReferencesCS()
    photo_dict = PhotosCS()
    photo_coll = PhotoCollectionCS()
    segmented_dict = Segmentation2D()
    annotations = Annotations()
    labels = Labels()

    # Create references dictionary
    tmp_ref = dict()
    for (root, dirs, files) in os.walk(INPUT_FOLDER, topdown=True):
        if any(files) and (dirs not in list(reference_dict.ref.keys())):
            tmp_ref[root] = len(reference_dict.ref.keys())
            rp = RefPath(len(reference_dict.ref.keys()), root)
            reference_dict.add_ref(rp)
    # Add references of segmented pictures if needed
    if SEGMENTED_CONTEXT_SCENE:
        for (root, dirs, files) in os.walk(SEGMENTATION_FOLDER, topdown=True):
            if any(files) and (dirs not in list(reference_dict.ref.keys())):
                tmp_ref[root] = len(reference_dict.ref.keys())
                rp = RefPath(len(reference_dict.ref.keys()), root)
                reference_dict.add_ref(rp)

    # Create pictures dictionary
    for (root, dirs, files) in os.walk(INPUT_FOLDER, topdown=True):
        if any(files):
            for _ in files:
                if _[-3:] in PICTURE_FORMAT:
                    photo_path = ImagePath(len(photo_dict.photo.keys()), f"{tmp_ref[root]}:{_}")
                    photo_dict.add_photo(photo_path)
    if ANNOTATIONS:
        with open(LABEL_FILE) as json_file:
            labels.labels = json.load(json_file)

    if SEGMENTED_CONTEXT_SCENE:
        # Create segmented picture dictionary
        for (root, dirs, files) in os.walk(SEGMENTATION_FOLDER, topdown=True):
            if any(files):
                for _ in files:
                    if _[-3:] in PICTURE_FORMAT:
                        segmented_path = RefPath(len(segmented_dict.segmentation2D.keys()), f"{tmp_ref[root]}:{_}")
                        segmented_dict.add_photo(segmented_path)

    photo_coll.add_photo(photo_dict)

    # Creation of the full context scene
    context_scene.set_photo_collection(photo_coll)
    if ANNOTATIONS:
        annotations.set_labels(labels.labels)
        annotations.set_segmentation2D(segmented_dict.segmentation2D)
        context_scene.set_annotations(annotations.annotationCS)
    context_scene.set_references(reference_dict)
    context_scene.save_json_contextscene(OUTPUT_FOLDER)


if __name__ == '__main__':
    main()
