import { expect } from "chai";
import { z } from "zod";
import {
  FileType,
  FileSchema,
  FilesSchema,
} from "../../src/service/files";

describe("FileType Enum", () => {
  it("should have PRESET value", () => {
    expect(FileType.PRESET).to.equal("Preset");
  });
});

describe("FileSchema", () => {
  it("should validate a correct file object", () => {
    const file = {
      id: "file123",
      name: "Preset File",
      type: FileType.PRESET,
      description: "A preset file",
      deprecated: true,
    };
    expect(() => FileSchema.parse(file)).to.not.throw();
  });

  it("should allow missing optional fields", () => {
    const file = {
      id: "file124",
      name: "Another Preset",
      type: FileType.PRESET,
    };
    expect(() => FileSchema.parse(file)).to.not.throw();
  });

  it("should fail if name is too short", () => {
    const file = {
      id: "file125",
      name: "Ab",
      type: FileType.PRESET,
    };
    expect(() => FileSchema.parse(file)).to.throw(z.ZodError);
  });

  it("should fail if name is too long", () => {
    const file = {
      id: "file126",
      name: "A".repeat(257),
      type: FileType.PRESET,
    };
    expect(() => FileSchema.parse(file)).to.throw(z.ZodError);
  });

  it("should fail if type is invalid", () => {
    const file = {
      id: "file127",
      name: "Valid Name",
      type: "InvalidType",
    };
    expect(() => FileSchema.parse(file)).to.throw(z.ZodError);
  });

  it("should fail if id is missing", () => {
    const file = {
      name: "Valid Name",
      type: FileType.PRESET,
    };
    expect(() => FileSchema.parse(file)).to.throw(z.ZodError);
  });
});

describe("FilesSchema", () => {
  it("should validate a correct files array", () => {
    const filesObj = {
      files: [
        {
          id: "file128",
          name: "File One",
          type: FileType.PRESET,
        },
        {
          id: "file129",
          name: "File Two",
          type: FileType.PRESET,
          deprecated: false,
        },
      ],
    };
    expect(() => FilesSchema.parse(filesObj)).to.not.throw();
  });

  it("should fail if files field is missing", () => {
    const filesObj = {};
    expect(() => FilesSchema.parse(filesObj)).to.throw(z.ZodError);
  });

  it("should fail if a file in the array is invalid", () => {
    const filesObj = {
      files: [
        {
          id: "file130",
          name: "Ok Name",
          type: FileType.PRESET,
        },
        {
          id: "file131",
          name: "No",
          type: FileType.PRESET,
        },
      ],
    };
    expect(() => FilesSchema.parse(filesObj)).to.throw(z.ZodError);
  });
});