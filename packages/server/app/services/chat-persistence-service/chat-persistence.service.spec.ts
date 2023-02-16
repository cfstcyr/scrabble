/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Application } from '@app/app';
import { ServicesTestingUnit } from '@app/services/service-testing-unit/services-testing-unit.spec';
import { expect } from 'chai';
import { Container } from 'typedi';
import DatabaseService from '@app/services/database-service/database.service';
import { ChatPersistenceService } from './chat-persistence.service';
import { CHANNEL_TABLE, USER_CHANNEL_TABLE, USER_TABLE } from '@app/constants/services-constants/database-const';
import { Channel, UserChannel } from '@common/models/chat/channel';
import { Knex } from 'knex';
import { UserDatabase } from '@common/models/user';

const CHANNEL_1: Channel = {
    idChannel: 1,
    name: '1',
    canQuit: true,
    private: false,
    default: false,
};
const CHANNEL_2: Channel = {
    idChannel: 2,
    name: '2',
    canQuit: true,
    private: false,
    default: false,
};
const USER: UserDatabase = {
    avatar: '',
    email: '',
    idUser: 1,
    password: '',
    username: '',
};

describe('ChatPersistenceService', () => {
    let service: ChatPersistenceService;
    let testingUnit: ServicesTestingUnit;
    let databaseService: DatabaseService;
    let channelTable: () => Knex.QueryBuilder<Channel>;
    let userChannelTable: () => Knex.QueryBuilder<UserChannel>;
    let userTable: () => Knex.QueryBuilder<UserDatabase>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedPrototypes(Application, { bindRoutes: undefined });
        await testingUnit.withMockDatabaseService();
        databaseService = Container.get(DatabaseService);
        channelTable = () => databaseService.knex<Channel>(CHANNEL_TABLE);
        userChannelTable = () => databaseService.knex<UserChannel>(USER_CHANNEL_TABLE);
        userTable = () => databaseService.knex<UserDatabase>(USER_TABLE);
    });

    beforeEach(() => {
        service = Container.get(ChatPersistenceService);
    });

    afterEach(() => {
        testingUnit.restore();
    });

    it('should create', () => {
        expect(service).to.exist;
    });

    describe('getChannels', () => {
        it('should return all channels', async () => {
            await channelTable().insert(CHANNEL_1);
            await channelTable().insert(CHANNEL_2);

            const channels = await service.getChannels();

            expect(channels).to.have.length(2);
            expect(channels.find((channel) => channel.idChannel === CHANNEL_1.idChannel)).to.exist;
            expect(channels.find((channel) => channel.idChannel === CHANNEL_2.idChannel)).to.exist;
        });
    });

    describe('getChannel', () => {
        it('should return channel', async () => {
            await channelTable().insert(CHANNEL_1);

            const channel = await service.getChannel(CHANNEL_1.idChannel);

            expect(channel?.idChannel).to.equal(CHANNEL_1.idChannel);
        });

        it('should return undefined if not in table', async () => {
            const channel = await service.getChannel(CHANNEL_1.idChannel);

            expect(channel).to.be.undefined;
        });
    });

    describe('getUserChannelIds', () => {
        it('should return default channels', async () => {
            await channelTable().insert({ ...CHANNEL_1, default: true });

            const channelIds = await service.getUserChannelIds(USER.idUser);

            expect(channelIds[0]).to.equal(CHANNEL_1.idChannel);
        });

        it('should return user channels', async () => {
            await userTable().insert(USER);
            await channelTable().insert(CHANNEL_1);
            await userChannelTable().insert({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser });

            const channelIds = await service.getUserChannelIds(USER.idUser);

            expect(channelIds[0]).to.equal(CHANNEL_1.idChannel);
        });
    });

    describe('saveChannel', () => {
        it('should add channel to table', async () => {
            await service.saveChannel(CHANNEL_1);

            expect(await channelTable().select().where({ idChannel: CHANNEL_1.idChannel })).to.have.length(1);
        });
    });

    describe('joinChannel', () => {
        it('should add entry to userChannel table', async () => {
            await userTable().insert(USER);
            await channelTable().insert(CHANNEL_1);

            await service.joinChannel(CHANNEL_1.idChannel, USER.idUser);

            expect(await userChannelTable().select().where({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser })).to.have.length(1);
        });

        it('should do nothing if entry already exists', async () => {
            await userTable().insert(USER);
            await channelTable().insert(CHANNEL_1);
            await userChannelTable().insert({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser });

            await service.joinChannel(CHANNEL_1.idChannel, USER.idUser);

            expect(await userChannelTable().select().where({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser })).to.have.length(1);
        });
    });

    describe('leaveChannel', () => {
        it('should remove entry from userChannel table', async () => {
            await userTable().insert(USER);
            await channelTable().insert(CHANNEL_1);
            await userChannelTable().insert({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser });

            await service.leaveChannel(CHANNEL_1.idChannel, USER.idUser);

            expect(await userChannelTable().select().where({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser })).to.have.length(0);
        });
    });

    describe('isChannelNameAvailable', () => {
        it('should return true if no channel with name exists', async () => {
            expect(await service.isChannelNameAvailable(CHANNEL_1)).to.be.true;
        });

        it('should return false if a channel with name already exists', async () => {
            await channelTable().insert(CHANNEL_1);
            expect(await service.isChannelNameAvailable(CHANNEL_1)).to.be.false;
        });

        it('should return true if added channel is private', async () => {
            await channelTable().insert(CHANNEL_1);
            expect(await service.isChannelNameAvailable({ ...CHANNEL_1, private: true })).to.be.true;
        });

        it('should return true if channel with same name is private', async () => {
            await channelTable().insert({ ...CHANNEL_1, private: true });
            expect(await service.isChannelNameAvailable(CHANNEL_1)).to.be.true;
        });
    });

    describe('createDefaultChannels', () => {
        it('should create channels', async () => {
            await service.createDefaultChannels([CHANNEL_1, CHANNEL_2]);

            const channels = await service.getChannels();

            expect(channels).to.have.length(2);
            expect(channels.find((channel) => channel.idChannel === CHANNEL_1.idChannel)).to.exist;
            expect(channels.find((channel) => channel.idChannel === CHANNEL_2.idChannel)).to.exist;
        });

        it('should not create channel if already there', async () => {
            await channelTable().insert({ ...CHANNEL_1, default: true });
            await service.createDefaultChannels([CHANNEL_1, CHANNEL_2]);

            const channels = await service.getChannels();

            expect(channels).to.have.length(2);
            expect(channels.find((channel) => channel.idChannel === CHANNEL_1.idChannel)).to.exist;
            expect(channels.find((channel) => channel.idChannel === CHANNEL_2.idChannel)).to.exist;
        });

        it('should replace channel if is not marked as default', async () => {
            await channelTable().insert({ ...CHANNEL_1 });
            await service.createDefaultChannels([CHANNEL_1, CHANNEL_2]);

            const channels = await service.getChannels();

            expect(channels.some((channel) => channel.idChannel === CHANNEL_1.idChannel && channel.default)).to.be.true;
        });
    });
});
