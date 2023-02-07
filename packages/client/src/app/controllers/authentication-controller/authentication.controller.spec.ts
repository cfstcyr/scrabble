import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthenticationController } from './authentication.controller';

describe('AuthenticationController', () => {
    let controller: AuthenticationController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        controller = TestBed.inject(AuthenticationController);
    });

    it('should be created', () => {
        expect(controller).toBeTruthy();
    });
});
