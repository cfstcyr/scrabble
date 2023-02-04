/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { AuthentificationController } from './authentification-controller';
import * as sinon from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { Application } from '@app/app';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('AuthentificationController', () => {
    let controller: AuthentificationController;
    let authentificationServiceStub: AuthentificationService;
    let expressApp: Express.Application;

    beforeEach(() => {
        const app = Container.get(Application);
        expressApp = app.app;
        controller = new AuthentificationController(authentificationServiceStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should be defined', () => {
        expect(controller).to.exist;
    });

    it('should call authentificationService.login on login request', async () => {
        const spy = chai.spy.on(controller, 'login', () => { });
        supertest(expressApp).post('api/authentification/login');
        expect(spy).to.have.been.called;
    });

    it('should call authentificationService.signUp on signUp request', async () => {
        const spy = chai.spy.on(controller, 'signUp', () => { });
        supertest(expressApp).post('api/authentification/signUp');
        expect(spy).to.have.been.called;
    });
});
