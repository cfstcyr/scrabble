import { Injectable } from '@angular/core';
import { GameHistoriesConverter } from '@app/classes/game-history/game-histories-converter';
import { GameHistory } from '@app/classes/game-history/game-history';
import { GameHistoryController } from '@app/controllers/game-history-controller/game-history.controller';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    constructor(private readonly gameHistoryController: GameHistoryController) {}

    async getGameHistories(): Promise<GameHistory[]> {
        return new Promise((resolve, reject) => {
            this.gameHistoryController
                .getGameHistories()
                .pipe(
                    retry(1),
                    catchError((error, caught) => {
                        reject(error);
                        return caught;
                    }),
                )
                .subscribe((gameHistories) => {
                    resolve(GameHistoriesConverter.convert(gameHistories));
                });
        });
    }

    async resetGameHistories(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.gameHistoryController
                .resetGameHistories()
                .pipe(
                    retry(1),
                    catchError((error, caught) => {
                        reject(error);
                        return caught;
                    }),
                )
                .subscribe(() => {
                    resolve();
                });
        });
    }
}
