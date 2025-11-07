import { expect } from "chai";
import { z } from "zod";
import {
    BucketSchema,
    URLSchema,
    ContainerLinksSchema,
    BucketResponseSchema
} from "../../service/bucket";

describe("BucketSchema", () => {
    it("should validate a correct bucket object", () => {
        const valid = { iTwinId: "test-id" };
        expect(() => BucketSchema.parse(valid)).to.not.throw();
    });

    it("should throw for missing iTwinId", () => {
        const invalid = {};
        expect(() => BucketSchema.parse(invalid)).to.throw(z.ZodError);
    });
});

describe("URLSchema", () => {
    it("should validate a correct URL object", () => {
        const valid = { href: "http://example.com" };
        expect(() => URLSchema.parse(valid)).to.not.throw();
    });

    it("should throw for missing href", () => {
        const invalid = {};
        expect(() => URLSchema.parse(invalid)).to.throw(z.ZodError);
    });
});

describe("ContainerLinksSchema", () => {
    it("should validate a correct ContainerLinks object", () => {
        const valid = { containerUrl: { href: "http://container.com" } };
        expect(() => ContainerLinksSchema.parse(valid)).to.not.throw();
    });

    it("should throw for missing containerUrl", () => {
        const invalid = {};
        expect(() => ContainerLinksSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should throw for invalid containerUrl", () => {
        const invalid = { containerUrl: { url: "bad" } };
        expect(() => ContainerLinksSchema.parse(invalid)).to.throw(z.ZodError);
    });
});

describe("BucketResponseSchema", () => {
    it("should validate a correct BucketResponse object", () => {
        const valid = {
            bucket: { iTwinId: "id123" },
            _links: { containerUrl: { href: "http://container.com" } },
        };
        expect(() => BucketResponseSchema.parse(valid)).to.not.throw();
    });

    it("should throw for missing bucket", () => {
        const invalid = {
            _links: { containerUrl: { href: "http://container.com" } },
        };
        expect(() => BucketResponseSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should throw for missing _links", () => {
        const invalid = {
            bucket: { iTwinId: "id123" },
        };
        expect(() => BucketResponseSchema.parse(invalid)).to.throw(z.ZodError);
    });

    it("should throw for invalid bucket and _links", () => {
        const invalid = {
            bucket: {},
            _links: {},
        };
        expect(() => BucketResponseSchema.parse(invalid)).to.throw(z.ZodError);
    });
});