/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ReferenceTableBrowser } from "./ReferenceTableBrowser";
chai.use(chaiAsPromised);


export function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

describe("Reference table tests", () => {
    describe("Add reference", () => {
        it("Add new reference", function () {
            const referenceTable = new ReferenceTableBrowser();
            const isAdded = referenceTable.addReference("test/path", "1");
            return expect(isAdded).equal(true);
        });

        it("Add reference that already exists in the reference table", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const isAdded = referenceTable.addReference("test/path", "1");
            return expect(isAdded).equal(false);
        });
    });

    describe("Remove reference", () => {
        it("Remove reference", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const isRemoved = referenceTable.removeReference("test/path", "1");
            return expect(isRemoved).equal(true);
        });

        it("Remove reference (not in reference table)", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const isRemovedInvalid = referenceTable.removeReference("invalid", "invalid");
            return expect(isRemovedInvalid).equal(false);
        });
    });

    describe("Has local path", () => {
        it("Has local path", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const hasPath = referenceTable.hasLocalPath("test/path");
            return expect(hasPath).equal(true);
        });

        it("Has local path (not in reference table)", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const hasPathInvalid = referenceTable.hasLocalPath("invalid");
            return expect(hasPathInvalid).equal(false);
        });
    });

    describe("Has cloud id", () => {
        it("Has cloud id", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const hasId = referenceTable.hasCloudId("1");
            return expect(hasId).equal(true);
        });

        it("Has cloud id (not in reference table)", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const hasIdInvalid = referenceTable.hasCloudId("2");
            return expect(hasIdInvalid).equal(false);
        });
    });

    describe("Get cloud id from local path", () => {
        it("Get cloud id from local path", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const id = referenceTable.getCloudIdFromLocalPath("test/path");
            return expect(id).equal("1");
        });

        it("Get cloud id from local path (not in reference table)", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const id = referenceTable.getCloudIdFromLocalPath("invalid");
            return expect(id).equal("");
        });
    });

    describe("Get local path from cloud id", () => {
        it("Get local path from cloud id", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const id = referenceTable.getLocalPathFromCloudId("1");
            return expect(id).equal("test/path");
        });

        it("Get local path from cloud id (not in reference table)", function () {
            const referenceTable = new ReferenceTableBrowser();
            referenceTable.addReference("test/path", "1");
            const id = referenceTable.getLocalPathFromCloudId("invalid");
            return expect(id).equal("");
        });
    });
});