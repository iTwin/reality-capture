import { expect } from 'chai';
import { Response } from '../../src/service/response';
import { DetailedErrorResponse } from '../../src/service/error'; // TODO : mock?

describe('Response', () => {
  it('should create a Response with only status_code', () => {
    const res = new Response<string>(200);

    expect(res.status_code).to.equal(200);
    expect(res.error).to.be.null;
    expect(res.value).to.be.null;
    expect(res.getResponseStatusCode()).to.equal(200);
    expect(res.isError()).to.be.false;
    expect(res).to.have.lengthOf(3);
    expect(res[0]).to.equal(200);
    expect(res[1]).to.be.null;
    expect(res[2]).to.be.null;
  });

  it('should create a Response with status_code and error', () => {
    const error: DetailedErrorResponse = { error: { code: 'ERR', message: 'Some error' } };
    const res = new Response<string>(400, error);

    expect(res.status_code).to.equal(400);
    expect(res.error).to.deep.equal(error);
    expect(res.value).to.be.null;
    expect(res.getResponseStatusCode()).to.equal(400);
    expect(res.isError()).to.be.true;
    expect(res[0]).to.equal(400);
    expect(res[1]).to.deep.equal(error);
    expect(res[2]).to.be.null;
  });

  it('should create a Response with status_code and value', () => {
    const res = new Response<string>(201, null, 'created');

    expect(res.status_code).to.equal(201);
    expect(res.error).to.be.null;
    expect(res.value).to.equal('created');
    expect(res.getResponseStatusCode()).to.equal(201);
    expect(res.isError()).to.be.false;
    expect(res[0]).to.equal(201);
    expect(res[1]).to.be.null;
    expect(res[2]).to.equal('created');
  });

  it('should handle undefined error and value', () => {
    const res = new Response<string>(204, undefined, undefined);

    expect(res.status_code).to.equal(204);
    expect(res.error).to.be.null;
    expect(res.value).to.be.null;
    expect(res.isError()).to.be.false;
  });
});