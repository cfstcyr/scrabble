import { VirtualPlayerData, VirtualPlayerProfile, VirtualPlayerProfilesData } from '@app/classes/database/virtual-player-profile';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import {
    DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH,
    VIRTUAL_PLAYER_PROFILES_MONGO_COLLECTION_NAME,
} from '@app/constants/services-constants/mongo-db-const';
import { NAME_ALREADY_USED, NO_PROFILE_OF_LEVEL } from '@app/constants/services-errors';
import DatabaseService from '@app/services/database-service/database.service';
import { Random } from '@app/utils/random/random';
import { promises } from 'fs';
import { StatusCodes } from 'http-status-codes';
import 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
import { Collection, ObjectId } from 'mongodb';
import { join } from 'path';
import { Service } from 'typedi';

@Service()
export default class VirtualPlayerProfilesService {
    constructor(private databaseService: DatabaseService) {}

    private static async fetchDefaultVirtualPlayerProfiles(): Promise<VirtualPlayerProfile[]> {
        const filePath = join(__dirname, DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH);
        const dataBuffer = await promises.readFile(filePath, 'utf-8');
        const defaultVirtualPlayerProfiles: VirtualPlayerProfilesData = JSON.parse(dataBuffer);
        return defaultVirtualPlayerProfiles.virtualPlayerProfiles;
    }

    async getAllVirtualPlayerProfiles(): Promise<VirtualPlayerProfile[]> {
        const data = await this.collection.find({}, { projection: { name: 1, level: 1, isDefault: 1 } }).toArray();
        const virtualPlayerProfiles: VirtualPlayerProfile[] = [];
        data.forEach((virtualPlayer) => {
            const profile: VirtualPlayerProfile = {
                name: virtualPlayer.name,
                level: virtualPlayer.level,
                // The underscore is necessary to access the ObjectId of the mongodb document which is written '_id'
                // eslint-disable-next-line no-underscore-dangle
                id: virtualPlayer._id.toString(),
                isDefault: virtualPlayer.isDefault,
            };
            virtualPlayerProfiles.push(profile);
        });
        return virtualPlayerProfiles;
    }

    async getVirtualPlayerProfilesFromLevel(level: VirtualPlayerLevel): Promise<VirtualPlayerProfile[]> {
        return this.collection.find({ level }).toArray();
    }

    async getRandomVirtualPlayerName(level: VirtualPlayerLevel): Promise<string> {
        const virtualPlayerProfile: VirtualPlayerProfile | undefined = Random.getRandomElementsFromArray(
            await this.getVirtualPlayerProfilesFromLevel(level),
        ).pop();
        if (virtualPlayerProfile) return virtualPlayerProfile.name;
        throw new HttpException(NO_PROFILE_OF_LEVEL, StatusCodes.NOT_FOUND);
    }

    async addVirtualPlayerProfile(newProfileData: VirtualPlayerData): Promise<void> {
        if (await this.isNameAlreadyUsed(newProfileData.name)) throw new HttpException(NAME_ALREADY_USED(newProfileData.name), StatusCodes.FORBIDDEN);

        await this.collection.insertOne({
            name: newProfileData.name,
            level: newProfileData.level,
            isDefault: false,
        } as VirtualPlayerProfile);
    }

    async updateVirtualPlayerProfile(newName: string, profileId: string): Promise<void> {
        if (await this.isNameAlreadyUsed(newName)) throw new HttpException(NAME_ALREADY_USED(newName), StatusCodes.FORBIDDEN);

        await this.collection.updateOne({ _id: new ObjectId(profileId), isDefault: false }, { $set: { name: newName } });
    }

    async deleteVirtualPlayerProfile(profileId: string): Promise<void> {
        await this.collection.deleteOne({ _id: new ObjectId(profileId), isDefault: false });
    }

    async resetVirtualPlayerProfiles(): Promise<void> {
        await this.collection.deleteMany({ isDefault: false });
        await this.populateDb();
    }

    private get collection(): Collection<VirtualPlayerProfile> {
        return this.databaseService.database.collection(VIRTUAL_PLAYER_PROFILES_MONGO_COLLECTION_NAME);
    }

    private async populateDb(): Promise<void> {
        await this.databaseService.populateDb(
            VIRTUAL_PLAYER_PROFILES_MONGO_COLLECTION_NAME,
            await VirtualPlayerProfilesService.fetchDefaultVirtualPlayerProfiles(),
        );
    }

    private async isNameAlreadyUsed(newName: string): Promise<boolean> {
        return (await this.collection.countDocuments({ name: newName })) > 0;
    }
}
