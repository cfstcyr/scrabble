import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GameHistoriesData } from '@app/classes/communication/game-histories';
import { GameHistoriesConverter } from '@app/classes/game-history/game-histories-converter';
import { GameHistoryController } from '@app/controllers/game-history-controller/game-history.controller';
import { GameHistoryWithPlayers } from '@common/models/game-history';
import { Observable, Subject, throwError } from 'rxjs';

import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let controllerSpy: jasmine.SpyObj<GameHistoryController>;

    beforeEach(() => {
        controllerSpy = jasmine.createSpyObj(GameHistoryController, {
            getGameHistories: new Observable<GameHistoriesData>(),
            resetGameHistories: new Observable<void>(),
        });

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: GameHistoryController, useValue: controllerSpy }],
        });
        service = TestBed.inject(GameHistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getGameHistories', () => {
        it('should call getGameHistories', () => {
            service.getGameHistories();
            expect(controllerSpy.getGameHistories).toHaveBeenCalled();
        });

        it('should call convert with result', (done) => {
            const data: GameHistoriesData = { gameHistories: [] };
            const subject = new Subject<GameHistoriesData>();
            const spy = spyOn(GameHistoriesConverter, 'convert');
            controllerSpy.getGameHistories.and.returnValue(subject);

            service.getGameHistories().finally(() => {
                expect(spy).toHaveBeenCalled();
                spy.and.callThrough();
                done();
            });

            subject.next(data);
        });

        it('should resolve with conversion result', (done) => {
            const expected = new Array<GameHistoryWithPlayers>();
            const subject = new Subject<GameHistoriesData>();
            const spy = spyOn(GameHistoriesConverter, 'convert').and.returnValue(expected);
            controllerSpy.getGameHistories.and.returnValue(subject);

            service
                .getGameHistories()
                .then((result) => {
                    expect(result).toEqual(expected);
                })
                .catch(() => {
                    expect(false).toBeTrue();
                })
                .finally(() => {
                    spy.and.callThrough();
                    done();
                });

            subject.next();
        });

        it('should reject on error', (done) => {
            controllerSpy.getGameHistories.and.returnValue(throwError('error'));

            let success = false;
            service
                .getGameHistories()
                .catch(() => {
                    success = true;
                })
                .finally(() => {
                    expect(success).toBeTrue();
                    done();
                });
        });
    });

    describe('resetGameHistories', () => {
        it('should call resetGameHistories', () => {
            service.resetGameHistories();
            expect(controllerSpy.resetGameHistories).toHaveBeenCalled();
        });

        it('should resolve on next', (done) => {
            const subject = new Subject<void>();
            controllerSpy.resetGameHistories.and.returnValue(subject);

            let success = false;
            service
                .resetGameHistories()
                .then(() => {
                    success = true;
                })
                .finally(() => {
                    expect(success).toBeTrue();
                    done();
                });

            subject.next();
        });

        it('should reject on error', (done) => {
            controllerSpy.resetGameHistories.and.returnValue(throwError('error'));

            let success = false;
            service
                .resetGameHistories()
                .catch(() => {
                    success = true;
                })
                .finally(() => {
                    expect(success).toBeTrue();
                    done();
                });
        });
    });
});
