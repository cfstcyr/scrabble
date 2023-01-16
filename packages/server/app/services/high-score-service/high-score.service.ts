import { GameType } from '@app/classes/game/game-type';
// import { DEFAULT_HIGH_SCORES_RELATIVE_PATH } from '@app/constants/services-constants/mongo-db-const';
import DatabaseService from '@app/services/database-service/database.service';
// import { promises } from 'fs';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
// import { join } from 'path';
import { Service } from 'typedi';
import { HighScore, HighScorePlayer, HighScoreWithPlayers } from '@app/schemas/high-score';
import { NoId } from '@app/schemas/schema';
import { HIGH_SCORE_COUNT } from '@app/constants/game-constants';
import { HIGH_SCORE_PLAYER_TABLE, HIGH_SCORE_TABLE } from '@app/constants/services-constants/database-const';
import { aggregate } from '@app/utils/aggregate/aggregate';

@Service()
export default class HighScoresService {
    constructor(private databaseService: DatabaseService) {}

    private get db() {
        return this.databaseService.knex<HighScore>(HIGH_SCORE_TABLE);
    }

    private get dbNames() {
        return this.databaseService.knex<HighScorePlayer>(HIGH_SCORE_PLAYER_TABLE);
    }

    // private static async fetchDefaultHighScores(): Promise<HighScore[]> {
    //     const filePath = join(__dirname, DEFAULT_HIGH_SCORES_RELATIVE_PATH);
    //     const dataBuffer = await promises.readFile(filePath, 'utf-8');
    //     const defaultHighScores: HighScoresData = JSON.parse(dataBuffer);
    //     return defaultHighScores.highScores;
    // }

    async getAllHighScore(): Promise<NoId<HighScoreWithPlayers>[]> {
        const highScores = await this.db
            .select('*')
            .leftJoin<HighScorePlayer>(HIGH_SCORE_PLAYER_TABLE, 'HighScore.id', 'HighScorePlayer.highScoreId');

        return aggregate(highScores, {
            idKey: 'id',
            fieldKey: 'names',
            mainItemKeys: ['gameType', 'score'],
            aggregatedItemKeys: 'name',
        });
    }

    async addHighScore(name: string, score: number, gameType: GameType): Promise<void> {
        const sortedHighScores = await this.getHighScores(gameType);

        const lowestHighScore = sortedHighScores[0];
        if (sortedHighScores.length >= HIGH_SCORE_COUNT && lowestHighScore.score > score) return;

        const presentHighScore = sortedHighScores.find((highScore) => highScore.score === score);

        if (presentHighScore) {
            await this.updateHighScore(name, presentHighScore);
            return;
        }

        await this.replaceHighScore(name, score, gameType, sortedHighScores.length >= HIGH_SCORE_COUNT ? sortedHighScores[0] : undefined);
    }

    async resetHighScores(): Promise<void> {
        await this.dbNames.delete();
        await this.db.delete();
    }

    private async updateHighScore(name: string, highScore: HighScore): Promise<void> {
        const existingNames = await this.dbNames.select('*').where('highScoreId', highScore.id);

        if (existingNames.some(({ name: existingName }) => existingName === name)) return;

        await this.dbNames.insert({ highScoreId: highScore.id, name });
    }

    private async replaceHighScore(name: string, score: number, gameType: string, oldHighScore?: HighScore): Promise<void> {
        if (oldHighScore) {
            await this.dbNames.delete().where('highScoreId', oldHighScore.id);
            await this.db.delete().where('id', oldHighScore.id);
        }

        const [{ id }] = await this.db.insert({ gameType, score }, ['id']);

        await this.dbNames.insert({ highScoreId: id, name });
    }

    private async getHighScores(gameType?: string): Promise<HighScore[]> {
        const q = this.db.select('*').orderBy('score');

        if (gameType) q.where('gameType', gameType);

        return q;
    }

    // private async populateDb(): Promise<void> {
    //     await this.databaseService.populateDb(HIGH_SCORES_MONGO_COLLECTION_NAME, await HighScoresService.fetchDefaultHighScores());
    // }
}
