import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ContainerClient } from "@azure/storage-blob";
import { expect } from "chai";
import sinon from "sinon";
import type { AuthorizationClient } from "../../service/auth";
import { BucketDataHandler, RealityDataHandler } from "../../service/data_handler";
import { Response } from "../../service/response";
import { RealityCaptureService } from "../../service/service";

describe("BucketDataHandler uploads", function () {
  let tempRoot: string;

  beforeEach(function () {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "reality-capture-"));
  });

  afterEach(function () {
    sinon.restore();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("does not upload a top-level symbolic link", async function () {
    const outsideFile = path.join(tempRoot, "outside.txt");
    const sourceLink = path.join(tempRoot, "source-link.txt");
    fs.writeFileSync(outsideFile, "outside");

    try {
      fs.symlinkSync(outsideFile, sourceLink, "file");
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "EPERM"
      ) {
        this.skip();
      }
      throw error;
    }

    const authorizationClient = {
      getAccessToken: sinon.stub().resolves("token"),
    } as AuthorizationClient;
    const handler = new BucketDataHandler(authorizationClient);
    sinon.stub(RealityCaptureService.prototype, "getBucket").resolves(
      new Response(200, null, {
        bucket: { iTwinId: "itwin-id" },
        _links: {
          containerUrl: { href: "https://example.test/container?sas=token" },
        },
      }),
    );
    const getBlockBlobClient = sinon.stub(
      ContainerClient.prototype,
      "getBlockBlobClient",
    );

    const response = await handler.uploadData("itwin-id", sourceLink);

    expect(response.status_code).to.equal(200);
    expect(getBlockBlobClient.called).to.equal(false);
  });
});

describe("RealityDataHandler uploads", function () {
  let tempRoot: string;
  let handler: RealityDataHandler;
  let updateRealityData: sinon.SinonStub;

  beforeEach(function () {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "reality-capture-"));
    const authorizationClient = {
      getAccessToken: sinon.stub().resolves("token"),
    } as AuthorizationClient;
    handler = new RealityDataHandler(authorizationClient);
    sinon.stub(RealityCaptureService.prototype, "getRealityDataWriteAccess").resolves(
      new Response(200, null, {
        _links: {
          containerUrl: { href: "https://example.test/container?sas=token" },
        },
      }),
    );
    updateRealityData = sinon.stub(RealityCaptureService.prototype, "updateRealityData");
  });

  afterEach(function () {
    sinon.restore();
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it("sets authoring to true before upload and back to false after", async function () {
    updateRealityData.resolves(new Response(200, null, {} as any));

    const response = await handler.uploadData("rd-id", tempRoot);

    expect(response.status_code).to.equal(200);
    expect(updateRealityData.callCount).to.equal(2);
    expect(updateRealityData.firstCall.args).to.deep.equal([{ authoring: true }, "rd-id"]);
    expect(updateRealityData.secondCall.args).to.deep.equal([{ authoring: false }, "rd-id"]);
  });

  it("returns the error if setting authoring fails", async function () {
    updateRealityData.resolves(new Response(403, { error: { code: "InsufficientPermissions", message: "Denied" } }, null));

    const response = await handler.uploadData("rd-id", tempRoot);

    expect(response.status_code).to.equal(403);
    expect(response.error!.error.code).to.equal("InsufficientPermissions");
    expect(updateRealityData.callCount).to.equal(1);
  });
});
