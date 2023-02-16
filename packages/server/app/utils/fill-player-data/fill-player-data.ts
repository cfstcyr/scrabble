import { GameUpdateData } from '@app/classes/communication/game-update-data';
import { PlayerData } from '@app/classes/communication/player-data';

export const fillPlayerData = (gameUpdateData: GameUpdateData, playerNumber: number, playerData: PlayerData) => {
    switch (playerNumber) {
        case 1: {
            gameUpdateData.player1 = playerData;
            break;
        }
        case 2: {
            gameUpdateData.player2 = playerData;
            break;
        }
        case 3: {
            gameUpdateData.player3 = playerData;
            break;
        }
        default: {
            gameUpdateData.player4 = playerData;
            break;
        }
    }
};
