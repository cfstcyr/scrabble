import { TestBed } from '@angular/core/testing';
import { PublicUser } from '@common/models/user';

import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('isUser', () => {
        it('should return true if current username is provided', () => {
            const username = 'Charles T pas cool';
            service.user = { username } as unknown as PublicUser;

            expect(service.isUser(username)).toBeTrue();
        });

        it('should return true if current user is provided', () => {
            const username = 'Charles T pas cool';
            service.user = { username } as unknown as PublicUser;

            expect(service.isUser(service.user)).toBeTrue();
        });
    });
});
