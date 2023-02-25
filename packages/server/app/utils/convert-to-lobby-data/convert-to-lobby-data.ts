import { GameConfig } from '@app/classes/game/game-config';
import { Group } from '@common/models/group';

export const convertToGroup = (config: GameConfig, id: string): Group => {
    return {
        maxRoundTime: config.maxRoundTime,
        groupId: id,
        gameVisibility
    };
};
