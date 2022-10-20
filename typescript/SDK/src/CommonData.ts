/** Status of a job. */
export enum JobState {
    UNKNOWN = "unknown",
    UNSUBMITTED = "unsubmitted",
    ACTIVE = "active",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled",

    Completed = "success",
    Pending = "pending",
    Running = "active",
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
    status: JobState
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
    THREEMX = "ThreeMX",
    THREESM = "ThreeSM",
};