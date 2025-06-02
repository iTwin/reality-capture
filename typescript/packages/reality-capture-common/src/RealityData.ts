/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/**
 * Data types used in ProjectWise ContextShare.
 */
export enum RealityDataType {
    CC_IMAGE_COLLECTION = "CCImageCollection",
    CC_ORIENTATIONS = "CCOrientations",
    CESIUM_3D_TILES = "Cesium3DTiles",
    GAUSSIAN_SPLAT_PLY = "GS_PLY",
    GAUSSIAN_SPLAT_SPZ = "GS_SPZ",
    GAUSSIAN_SPLAT_CESIUM_3D_TILES = "GS_3DT",
    CONTEXT_DETECTOR = "ContextDetector",
    CONTEXT_SCENE = "ContextScene",
    DGN = "DGN",
    LAS = "LAS",
    LAZ = "LAZ",
    OPC = "OPC",
    PLY = "PLY",
    POD = "POD",
    POINTCLOUD = "PointCloud",
    SCAN_COLLECTION = "ScanCollection",
    SHP = "SHP",
    THREEMX = "3MX",
    THREESM = "3SM",
    E57 = "E57",
    UNSTRUCTURED = "Unstructured"
}
