import { authenticateToken } from './authentificate-token';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { Request, Response } from 'express';


const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('authenticateToken', () => {
    afterEach(() => {
        chai.spy.restore();
    });

    it('Should throw HTTP execption - 401 if user has invalid token', () => {
        const resMock = {} as unknown as Response;
        const reqMock = { headers: { authorisation: 'token' } } as unknown as Request;
        const next = chai.spy();

        authenticateToken(reqMock, resMock, next)
        expect(next).to.have.been.called;
    });

    it('Should throw HTTP execption - 401 if user has invalid token', () => {
        const resMock = {} as unknown as Response;
        const reqMock = { headers: { authorisation: 'Bearer: TOKENNN' } } as unknown as Request;
        const next = chai.spy();

        authenticateToken(reqMock, resMock, next)
        expect(next).to.have.been.called;
    });


});