import { AuthentificationService } from '@app/services/authentification-service/authentification.service';
import { expect } from 'chai';
import { AuthentificationController } from './authentification-controller';

describe('AuthentificationController', () => {
    let controller: AuthentificationController;
    let authentificationServiceStub: AuthentificationService;

    beforeEach(() => {
        controller = new AuthentificationController(authentificationServiceStub);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
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
