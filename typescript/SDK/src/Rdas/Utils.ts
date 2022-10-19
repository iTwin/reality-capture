import { JobDates } from "../Utils/CommonData";
import { JobSettings } from "./Settings";

/** Possible types of a job. */
export enum RDAJobType {
    NONE = "not recognized",
    O2D = "objects2D",
    S2D = "segmentation2D",
    O3D = "objects3D",
    S3D = "segmentation3D",
    ChangeDetection = "changeDetection",
    L3D = "lines3D",
}

/**
 * Parameters for estimating job cost before its processing.
 * Estimated_cost is filled when this object is returned by a function but should only be taken in consideration if you
 * have updated parameters for estimation before by using the get_job_estimated_cost function.
 * Args:
 * - giga_pixels: Number of giga pixels in inputs.
 * - number_photos: Number of photos in inputs.
 * - scene_width: Width of the scene.
 * - scene_length: Height of the scene.
 * - detector_scale: Length of the scene.
 * - detector_cost: Scale of the detector.
 * - estimated_cost: Estimated cost of the detector.
 */
export interface RDACostParameters {
    gigaPixels?: number;
    numberOfPhotos?: number;
    sceneWidth?: number;
    sceneHeight?: number;
    sceneLength?: number;
    detectorScale?: number;
    detectorCost?: number;
    estimatedCost?: number;
}

/**
 * Properties of a job.
 * Convenience class to stock all properties of a job in a simple way.
 */
export interface RDAJobProperties {
    name: string;
    type: RDAJobType;
    settings: JobSettings;
    iTwinId: string;
    id: string;
    dataCenter?: string;
    email?: string;
    state?: string;
    dates?: JobDates;
    exitCode?: string;
    executionCost?: string;
    costEstimation?: RDACostParameters;
}