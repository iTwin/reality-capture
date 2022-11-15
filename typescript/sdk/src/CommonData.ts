/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

/** Client information to get access to services. */
export interface ClientInfo {
    clientId: string,
    scopes: Set<string>,
    env?: string,
    secret?: string,
    redirectUrl?: string,
}

/** Status of a job. */
export enum JobState {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    COMPLETED = "success",
    FAILED = "failed",
    OVER = "over",
    PENDING = "pending",
    RUNNING = "active",
    SUCCESS = "success",
    UNKNOWN = "unknown",
    UNSUBMITTED = "unsubmitted",
};

/**
 * Job creation, submission, start and end dates.
 */
export interface JobDates {
    createdDateTime?: string;
    submissionDateTime?: string;
    startedDateTime?: string;
    endedDateTime?: string;
};

/** 
 * Progress for the job. 
 * Contains the status for the job, and it's percentage progression as an integer value between 0 and 100
 */
export interface JobProgress {
    state: JobState
    progress: number;
    step: string;
};

/**
 * Data types used in ProjectWise ContextShare.
 */
export enum RealityDataType {
    CC_IMAGE_COLLECTION = "CCImageCollection",
    CC_ORIENTATIONS = "CCOrientations",
    CONTEXT_DETECTOR = "ContextDetector",
    CONTEXT_SCENE = "ContextScene",
    LAS = "LAS",
    LAZ = "LAZ",
    OPC = "OPC",
    PLY = "PLY",
    POINTCLOUD = "PointCloud",
    SCAN_COLLECTION = "ScanCollection",
    THREEMX = "3MX",
    THREESM = "3SM",
};