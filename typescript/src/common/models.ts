/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

interface Object2D {
    labelId : number;
    xmin : number;
    ymin : number;
    xmax : number;
    ymax : number;
}

interface Segmentation2D {
    id : number;
    path : string;
}

interface AnnotatedPhoto {
    path: string;
    name: string;
    objects2D: Object2D[];
    segmentation2D: Segmentation2D;
}

interface Reference {
    collectionId: string;
    collectionStorageUrl: string;
}

export interface Color {
    r: number;
    g: number;
    b: number;
}

export interface ContextScene {
    photos: Map<number, AnnotatedPhoto>;
    lines3D: string;
    references: Map<number, Reference>;
    labels: Map<number, Color>;
}