/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { getAccessTokenFromBackend, TestUsers } from "@itwin/oidc-signin-tool/lib/cjs/frontend";
chai.use(chaiAsPromised);

describe("CC", () => {

    before(async () => {
        const accessToken = await getAccessTokenFromBackend(TestUsers.regular);
        await fetch("http://localhost:3001/requests/accesstoken/" + accessToken);
    });

    it("Context capture job", async function () { 
        this.timeout(300000); // 5mn
        let response = await fetch("http://localhost:3001/requests/upload/" + "CCImageCollection" + "/" + "/data/CC/Images");
        let json = await response.json();
        const images = json.id;
        expect(images).is.not.undefined;
        expect(images).to.have.lengthOf(36);

        response = await fetch("http://localhost:3001/requests/upload/" + "CCOrientations" + "/" + "/data/CC/Orientation");
        json = await response.json();
        const orientation = json.id;
        expect(orientation).is.not.undefined;
        expect(orientation).to.have.lengthOf(36); 

        this.timeout(3600000); // 60mn
        const jobInputs = new Map<string, string>();
        jobInputs.set(images, "CCS sample app image collection");
        jobInputs.set(orientation, "CCS sample app CCOrientation");
        const jobResult = fetch("http://localhost:3001/requests/contextCapture", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "Full",
                inputs: [...jobInputs],
            })
        });
        let state = "";
        while(state !== "Failed" && state !== "Done" && state !== "Cancelled") {
            const progress = await fetch("http://localhost:3001/requests/progressCCS");
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