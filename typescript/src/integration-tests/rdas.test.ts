/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { getAccessTokenFromBackend, TestUsers } from "@itwin/oidc-signin-tool/lib/cjs/frontend";
chai.use(chaiAsPromised);

describe("RDAS", () => {

    beforeEach(async () => {
        const accessToken = await getAccessTokenFromBackend(TestUsers.regular);
        await fetch("http://localhost:3001/requests/accesstoken/" + accessToken);
    });

    it("job O2D", async function() {
        this.timeout(300000); // 5mn
        let response = await fetch("http://localhost:3001/requests/upload/" + "CCImageCollection" + "/" + "/data/O2D/Images");
        let json = await response.json();
        expect(json.id).is.not.undefined;
        expect(json.id).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextScene" + "/" + "/data/O2D/Scene");
        json = await response.json();
        let sceneId = json.id;
        expect(sceneId).is.not.undefined;
        expect(sceneId).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextDetector" + "/" + "/data/O2D/Coco2017_v1.19");
        json = await response.json();
        let detectorId = json.id;
        expect(detectorId).is.not.undefined;
        expect(detectorId).to.have.lengthOf(36);

        this.timeout(3600000); // 60mn
        const jobInputs = new Map<string, string>();
        jobInputs.set("photos", sceneId);
        jobInputs.set("photoObjectDetector", detectorId);
        const jobOutputTypes = [];
        jobOutputTypes.push("objects2D");
        const jobType = "objects2D";
        const jobResult = fetch("http://localhost:3001/requests/rdas", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: [...jobInputs],
                outputTypes: jobOutputTypes,
                jobType: jobType,
            })
        });

        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            const progress = await fetch("http://localhost:3001/requests/progress");
            const progressJson = await progress.json();
            state = progressJson.step ?? progressJson.error;
        }
        const resolved = await jobResult;
        const responseJson = await resolved.json();
        const ids = responseJson.outputIds;

        expect(state).to.deep.equal("Done");
        expect(ids).is.not.undefined;
        expect(ids).to.have.length(1);
        expect(ids[0]).to.have.length(36);
    });

    it("job S2D", async function() {
        this.timeout(300000); // 5mn
        let response = await fetch("http://localhost:3001/requests/upload/" + "CCImageCollection" + "/" + "/data/S2D/Images");
        let json = await response.json();
        expect(json.id).is.not.undefined;
        expect(json.id).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextScene" + "/" + "/data/S2D/Scene");
        json = await response.json();
        let sceneId = json.id;
        expect(sceneId).is.not.undefined;
        expect(sceneId).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextDetector" + "/" + "/data/S2D/CracksAppliedAI_v1");
        json = await response.json();
        let detectorId = json.id;
        expect(detectorId).is.not.undefined;
        expect(detectorId).to.have.lengthOf(36);

        this.timeout(3600000); // 60mn
        const jobInputs = new Map<string, string>();
        jobInputs.set("photos", sceneId);
        jobInputs.set("photoSegmentationDetector", detectorId);
        const jobOutputTypes = [];
        jobOutputTypes.push("segmentation2D");
        const jobType = "segmentation2D";
        const jobResult = fetch("http://localhost:3001/requests/rdas", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: [...jobInputs],
                outputTypes: jobOutputTypes,
                jobType: jobType,
            })
        });

        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            const progress = await fetch("http://localhost:3001/requests/progress");
            const progressJson = await progress.json();
            state = progressJson.step ?? progressJson.error;
        }
        const resolved = await jobResult;
        const responseJson = await resolved.json();
        const ids = responseJson.outputIds;

        expect(state).to.deep.equal("Done");
        expect(ids).is.not.undefined;
        expect(ids).to.have.length(1);
        expect(ids[0]).to.have.length(36);
    });

    it("job L3D", async function() {
        this.timeout(300000); // 5mn
        let response = await fetch("http://localhost:3001/requests/upload/" + "3MX" + "/" + "/data/L3D/3MX");
        let json = await response.json();
        expect(json.id).is.not.undefined;
        expect(json.id).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextScene" + "/" + "/data/L3D/MeshScene");
        json = await response.json();
        let meshId = json.id;
        expect(json.id).is.not.undefined;
        expect(json.id).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "CCImageCollection" + "/" + "/data/L3D/Images");
        json = await response.json();
        expect(json.id).is.not.undefined;
        expect(json.id).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextScene" + "/" + "/data/L3D/OrientedPhotos");
        json = await response.json();
        let sceneId = json.id;
        expect(sceneId).is.not.undefined;
        expect(sceneId).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "ContextDetector" + "/" + "/data/L3D/CracksA_v1");
        json = await response.json();
        let detectorId = json.id;
        expect(detectorId).is.not.undefined;
        expect(detectorId).to.have.lengthOf(36);

        this.timeout(3600000); // 60mn
        const jobInputs = new Map<string, string>();
        jobInputs.set("meshes", meshId);
        jobInputs.set("orientedPhotos", sceneId);
        jobInputs.set("photoSegmentationDetector", detectorId);
        const jobOutputTypes = [];
        jobOutputTypes.push("lines3D");
        jobOutputTypes.push("segmentation2D");
        const jobType = "lines3D";
        const jobResult = fetch("http://localhost:3001/requests/rdas", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: [...jobInputs],
                outputTypes: jobOutputTypes,
                jobType: jobType,
            })
        });
        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            const progress = await fetch("http://localhost:3001/requests/progress");
            const progressJson = await progress.json();
            state = progressJson.step ?? progressJson.error;
        }
        const resolved = await jobResult;
        const responseJson = await resolved.json();
        const ids = responseJson.outputIds;

        expect(state).to.deep.equal("Done");
        expect(ids).is.not.undefined;
        expect(ids).to.have.length(2);
        expect(ids[0]).to.have.length(36);
        expect(ids[1]).to.have.length(36);
    });
});