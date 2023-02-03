/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as spies from 'chai-spies';
import { AuthentificationController } from './authentification-controller';

const expect = chai.expect;
chai.use(spies);
chai.use(chaiAsPromised);

describe('AuthentificationController', () => {
    let controller: AuthentificationController;
    let authentificationServiceStub: AuthentificationService;

    beforeEach(() => {
        controller = new AuthentificationController(authentificationServiceStub);
    });

    it('should be defined', () => {
        expect(controller).to.exist;
    });

    it('should call authentificationService.login on login request', () => {
        // TODO
    });

    it('should call authentificationService.signUp on signUp request', () => {
        // TODO
    });

    it('should call authentificationService.logout on logout request', () => {
        // TODO
    });
    it('should call validate on validate request', () => {
        // TODO
    });
});
