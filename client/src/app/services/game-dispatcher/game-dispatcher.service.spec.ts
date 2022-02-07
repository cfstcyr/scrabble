import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { GameDispatcherController } from '@app/controllers/game-dispatcher-controller/game-dispatcher.controller';
import { SocketService } from '@app/services/socket/socket.service';
import { GameDispatcherService } from './game-dispatcher.service';

describe('GameDispatcherService', () => {
    let service: GameDispatcherService;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientModule], providers: [GameDispatcherController, SocketService] });
        service = TestBed.inject(GameDispatcherService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
