import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { ContainerClient } from "@azure/storage-blob";
import { expect } from "chai";
import sinon from "sinon";
import type { AuthorizationClient } from "../../service/auth";
import { BucketDataHandler } from "../../service/data_handler";
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
