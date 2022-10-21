import { JobDates } from "../CommonData";
import { CCJobSettings, CCMeshQuality } from "./Settings";

/** Possible types of a CCS job. */
export enum CCJobType {
    NONE = "not recognized",
    CALIBRATION = "Calibration",
    RECONSTRUCTION = "Reconstruction",
    FULL = "Full",
}

/** 
 * Properties of a workspace.
 */
export interface CCWorkspaceProperties {
    id: string;
    createdDateTime: string;
    name: string;
    iTwinId: string;
    contextCaptureVersion?: string;
}

export interface CCCostParameters {
    gigaPixels?: number;
    megaPoints?: number;
    meshQuality?: CCMeshQuality;
}

/**
 * Properties of a job.
 * Convenience interface to stock all properties of a job in a simple way.
 */
export interface CCJobProperties {
    name: string;
    type: CCJobType;
    settings: CCJobSettings;
    workspaceId: string;
    iTwinId: string;
    id: string;
    location?: string;
    email?: string;
    state?: string;
    dates?: JobDates;
    exitCode?: string;
    executionCost?: string;
    costEstimationParameters?: CCCostParameters;
    estimatedCost?: string;
}
