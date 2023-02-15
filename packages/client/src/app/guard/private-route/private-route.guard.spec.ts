import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PrivateRouteGuard } from './private-route.guard';

describe('PrivateRouteGuard', () => {
    let guard: PrivateRouteGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
        });
        guard = TestBed.inject(PrivateRouteGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });
});
