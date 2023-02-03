import { TestBed } from '@angular/core/testing';
import { ClientSocket } from '@app/classes/communication/socket-type';
import SocketService from '@app/services/socket-service/socket.service';

import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socket: jasmine.SpyObj<ClientSocket>;
    let socketService: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socket = jasmine.createSpyObj('Socket', ['on', 'emit']);
        socketService = jasmine.createSpyObj('SocketService', ['initializeService', 'getId', 'on'], { socket });

        TestBed.configureTestingModule({
            providers: [{ provide: SocketService, useValue: socketService }],
        });
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
