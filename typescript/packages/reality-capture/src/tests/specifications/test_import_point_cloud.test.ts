import { expect } from "chai";
import { z } from "zod";
import {
    ImportPCInputsSchema,
    ImportPCOutputsSchema,
    ImportPCSpecificationsSchema,
    ImportPCOutputsCreate,
    ImportPCSpecificationsCreateSchema,
    ImportPCCostSchema,
    Point3dTimeSchema,
    ScanSchema,
    PodMetadataSchema
} from "../../specifications/import_point_cloud";

describe("ImportPCInputsSchema", () => {
    it("should validate correct inputs", () => {
        const data = { scene: "contextSceneId" };
        expect(() => ImportPCInputsSchema.parse(data)).not.to.throw();
    });

    it("should fail for missing scene", () => {
        const data = {};
        expect(() => ImportPCInputsSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("ImportPCOutputsSchema", () => {
    it("should validate scanCollection and optional scene", () => {
        const data = { scanCollection: "scanId", scene: "sceneId" };
        expect(() => ImportPCOutputsSchema.parse(data)).not.to.throw();
    });

    it("should validate scanCollection only", () => {
        const data = { scanCollection: "scanId" };
        expect(() => ImportPCOutputsSchema.parse(data)).not.to.throw();
    });

    it("should fail for missing scanCollection", () => {
        const data = { scene: "sceneId" };
        expect(() => ImportPCOutputsSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("ImportPCSpecificationsSchema", () => {
    it("should validate correct structure", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: { scanCollection: "scanId", scene: "sceneId" }
        };
        expect(() => ImportPCSpecificationsSchema.parse(data)).not.to.throw();
    });

    it("should fail for invalid inputs", () => {
        const data = {
            inputs: {},
            outputs: { scanCollection: "scanId" }
        };
        expect(() => ImportPCSpecificationsSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("ImportPCSpecificationsCreateSchema", () => {
    it("should validate output enum values", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: [ImportPCOutputsCreate.SCAN_COLLECTION, ImportPCOutputsCreate.SCENE]
        };
        expect(() => ImportPCSpecificationsCreateSchema.parse(data)).not.to.throw();
    });

    it("should fail for invalid output values", () => {
        const data = {
            inputs: { scene: "sceneId" },
            outputs: ["invalidValue"]
        };
        expect(() => ImportPCSpecificationsCreateSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("ImportPCCostSchema", () => {
    it("should validate non-negative mpoints", () => {
        expect(() => ImportPCCostSchema.parse({ mpoints: 10 })).not.to.throw();
    });

    it("should fail for negative mpoints", () => {
        expect(() => ImportPCCostSchema.parse({ mpoints: -1 })).to.throw(z.ZodError);
    });
});

describe("Point3dTimeSchema", () => {
    it("should validate correct point with timestamp", () => {
        const data = { x: 1, y: 2, z: 3, t: 1234567890 };
        expect(() => Point3dTimeSchema.parse(data)).not.to.throw();
    });

    it("should fail for missing t", () => {
        const data = { x: 1, y: 2, z: 3 };
        expect(() => Point3dTimeSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("ScanSchema", () => {
    it("should validate static scan with position", () => {
        const data = {
            name: "scan1",
            numPoints: 1000,
            hasColor: true,
            hasIntensity: true,
            hasClassification: false,
            position: { x: 1, y: 2, z: 3 }
        };
        expect(() => ScanSchema.parse(data)).not.to.throw();
    });

    it("should validate mobile scan with trajectories", () => {
        const trajectory = [
            [{ x: 1, y: 2, z: 3, t: 0 }, { x: 4, y: 5, z: 6, t: 1 }]
        ];
        const data = {
            name: "scan2",
            numPoints: 2000,
            hasColor: false,
            hasIntensity: true,
            hasClassification: true,
            trajectories: trajectory
        };
        expect(() => ScanSchema.parse(data)).not.to.throw();
    });

    it("should fail for missing required fields", () => {
        const data = {};
        expect(() => ScanSchema.parse(data)).to.throw(z.ZodError);
    });
});

describe("PodMetadataSchema", () => {
    it("should validate correct pod metadata", () => {
        const data = {
            minRes: 0.1,
            maxRes: 1.0,
            meanRes: 0.5,
            medRes: 0.4,
            minIntensity: -32768,
            maxIntensity: 32767,
            crs: "EPSG:4326",
            bounding: {
                xmin: 0, ymin: 0, zmin: 0, xmax: 10, ymax: 10, zmax: 10
            },
            scans: [
                {
                    name: "scan1",
                    numPoints: 1000,
                    hasColor: true,
                    hasIntensity: true,
                    hasClassification: false,
                    position: { x: 1, y: 2, z: 3 }
                }
            ]
        };
        expect(() => PodMetadataSchema.parse(data)).not.to.throw();
    });

    it("should fail for intensity out of bounds", () => {
        const data = {
            minRes: 0.1,
            maxRes: 1.0,
            meanRes: 0.5,
            medRes: 0.4,
            minIntensity: -40000,
            maxIntensity: 40000,
            crs: "EPSG:4326",
            bounding: {
                min: { x: 0, y: 0, z: 0 },
                max: { x: 10, y: 10, z: 10 }
            },
            scans: [
                {
                    name: "scan1",
                    numPoints: 1000,
                    hasColor: true,
                    hasIntensity: true,
                    hasClassification: false,
                    position: { x: 1, y: 2, z: 3 }
                }
            ]
        };
        expect(() => PodMetadataSchema.parse(data)).to.throw(z.ZodError);
    });
});
