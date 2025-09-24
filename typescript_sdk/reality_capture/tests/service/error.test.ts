import { expect } from "chai";
import { z } from "zod";
import {
  ErrorSchema,
  DetailedErrorSchema,
  DetailedErrorResponseSchema,
} from "../../src/service/error";

describe("ErrorSchema", () => {
  it("should validate a correct error object", () => {
    const error = {
      code: "INVALID_INPUT",
      message: "Input is not valid",
      target: "field",
    };
    expect(() => ErrorSchema.parse(error)).to.not.throw();
  });

  it("should allow missing optional 'target'", () => {
    const error = {
      code: "NOT_FOUND",
      message: "Resource not found",
    };
    expect(() => ErrorSchema.parse(error)).to.not.throw();
  });

  it("should fail if code is missing", () => {
    const error = {
      message: "Missing code",
    };
    expect(() => ErrorSchema.parse(error)).to.throw(z.ZodError);
  });

  it("should fail if message is missing", () => {
    const error = {
      code: "ERR",
    };
    expect(() => ErrorSchema.parse(error)).to.throw(z.ZodError);
  });
});

describe("DetailedErrorSchema", () => {
  it("should validate a correct detailed error object", () => {
    const detailedError = {
      code: "INVALID_INPUT",
      message: "Input is invalid",
      target: "file",
      details: [
        { code: "FIELD_REQUIRED", message: "Field X is required", target: "X" },
        { code: "FIELD_INVALID", message: "Field Y is invalid" },
      ],
    };
    expect(() => DetailedErrorSchema.parse(detailedError)).to.not.throw();
  });

  it("should allow missing optional 'target' and 'details'", () => {
    const detailedError = {
      code: "ERROR_CODE",
      message: "Something went wrong",
    };
    expect(() => DetailedErrorSchema.parse(detailedError)).to.not.throw();
  });

  it("should fail if code is missing", () => {
    const detailedError = {
      message: "Missing code",
    };
    expect(() => DetailedErrorSchema.parse(detailedError)).to.throw(z.ZodError);
  });

  it("should fail if message is missing", () => {
    const detailedError = {
      code: "ERR",
    };
    expect(() => DetailedErrorSchema.parse(detailedError)).to.throw(z.ZodError);
  });

  it("should fail if details array has invalid error objects", () => {
    const detailedError = {
      code: "ERR",
      message: "msg",
      details: [
        { message: "Missing code" }, // code is missing
      ],
    };
    expect(() => DetailedErrorSchema.parse(detailedError)).to.throw(z.ZodError);
  });
});

describe("DetailedErrorResponseSchema", () => {
  it("should validate correct detailed error response", () => {
    const response = {
      error: {
        code: "ERR",
        message: "msg",
        details: [
          { code: "E1", message: "Detail msg 1" },
          { code: "E2", message: "Detail msg 2", target: "field" },
        ],
      },
    };
    expect(() => DetailedErrorResponseSchema.parse(response)).to.not.throw();
  });

  it("should fail if 'error' field is missing", () => {
    const response = {};
    expect(() => DetailedErrorResponseSchema.parse(response)).to.throw(z.ZodError);
  });

  it("should fail if 'error' field is invalid", () => {
    const response = {
      error: {
        code: "ERR",
        // Missing message
      },
    };
    expect(() => DetailedErrorResponseSchema.parse(response)).to.throw(z.ZodError);
  });
});