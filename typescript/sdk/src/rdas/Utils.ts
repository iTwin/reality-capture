/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { JobDates, JobState } from "../CommonData";
import { JobSettings, RDAJobType } from "./Settings";

/**
 * Parameters for estimating job cost before its processing.
 */
export interface RDACostParameters {
    /** Number of giga pixels in inputs. */
    gigaPixels?: number;
    /** Number of photos in inputs. */
    numberOfPhotos?: number;
    /** Width of the scene. */
    sceneWidth?: number;
    /** Height of the scene. */
    sceneHeight?: number;
    /** Length of the scene. */
    sceneLength?: number;
    /** Scale of the detector. */
    detectorScale?: number;
    /** Cost of the detector. */
    detectorCost?: number;
    /** Estimated cost of the detector. */
    estimatedCost?: number;
}

/**
 * Properties of a job.
 * Convenience interface to stock all properties of a job in a simple way.
 */
export interface RDAJobProperties {
    name: string;
    type: RDAJobType;
    settings: JobSettings;
    iTwinId: string;
    id: string;
    dataCenter?: string;
    email?: string;
    state?: JobState;
    dates?: JobDates;
    exitCode?: string;
    executionCost?: number;
    costEstimation?: RDACostParameters;
}