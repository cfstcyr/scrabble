import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PublicRouteGuard } from './public-route.guard';

describe('PublicRouteGuard', () => {
    let guard: PublicRouteGuard;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
        });
        guard = TestBed.inject(PublicRouteGuard);
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });
});
