import { GameHistory } from '@app/classes/database/game-history';
import { GAME_HISTORIES_MONGO_COLLECTION_NAME } from '@app/constants/services-constants/mongo-db-const';
import DatabaseService from '@app/services/database-service/database.service';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Collection } from 'mongodb';
import { Service } from 'typedi';

@Service()
export default class GameHistoriesService {
    constructor(private databaseService: DatabaseService) {}

    async getAllGameHistories(): Promise<GameHistory[]> {
        return (await this.collection.find({}).toArray()).sort((previous, current) => previous.endTime.getTime() - current.endTime.getTime());
    }

    async addGameHistory(newHistory: GameHistory): Promise<void> {
        await this.collection.insertOne(newHistory);
    }

    async resetGameHistories(): Promise<void> {
        await this.collection.deleteMany({});
    }

    private get collection(): Collection<GameHistory> {
        return this.databaseService.database.collection(GAME_HISTORIES_MONGO_COLLECTION_NAME);
    }
}
