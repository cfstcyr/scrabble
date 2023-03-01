/* eslint-disable dot-notation */
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
import { User } from '@common/models/user';
import { UserId } from '@app/classes/user/connected-user-types';
import * as sinon from 'sinon';
import { ChatHistoryService } from '@app/services/chat-history/chat-history.service';

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
const USER: User = {
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
    let userTable: () => Knex.QueryBuilder<User>;
    let chatHistoryService: sinon.SinonStubbedInstance<ChatHistoryService>;

    beforeEach(async () => {
        testingUnit = new ServicesTestingUnit().withStubbedPrototypes(Application, { bindRoutes: undefined });
        await testingUnit.withMockDatabaseService();
        databaseService = Container.get(DatabaseService);
        channelTable = () => databaseService.knex<Channel>(CHANNEL_TABLE);
        userChannelTable = () => databaseService.knex<UserChannel>(USER_CHANNEL_TABLE);
        userTable = () => databaseService.knex<User>(USER_TABLE);
        chatHistoryService = testingUnit.setStubbed(ChatHistoryService);
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

    describe('getChannelUserIds', () => {
        it('should make every userId in channel quit', async () => {
            const expectedUser1 = { ...USER, idUser: 1, username: 'user1', email: 'email1' };
            const expectedUser2 = { ...USER, idUser: 2, username: 'user2', email: 'email2' };
            const expectedUser3 = { ...USER, idUser: 3, username: 'user3', email: 'email3' };
            const expectedIds = [expectedUser1.idUser, expectedUser2.idUser, expectedUser3.idUser];

            const userChannelTableExample = [
                { idUser: expectedUser1.idUser, idChannel: CHANNEL_1.idChannel },
                { idUser: expectedUser2.idUser, idChannel: CHANNEL_1.idChannel },
                { idUser: expectedUser3.idUser, idChannel: CHANNEL_1.idChannel },
            ];

            await service['channelTable'].insert(CHANNEL_1);
            await databaseService.knex.insert([expectedUser1, expectedUser2, expectedUser3]).into(USER_TABLE);
            await service['userChatTable'].insert(userChannelTableExample);

            const result: UserId[] = await service.getChannelUserIds(CHANNEL_1.idChannel);

            expect(result).to.deep.equal(expectedIds);
        });

        it('should NOT make userId NOT in channel quit', async () => {
            const userInChannel = { ...USER, idUser: 1, username: 'user1', email: 'email1' };
            const userNotInChannel = { ...USER, idUser: 2, username: 'user2', email: 'email2' };

            const differentChannel: Channel = { ...CHANNEL_1, name: 'different channel', idChannel: CHANNEL_1.idChannel + 1 };

            const userChannelTableExample = [
                { idUser: userInChannel.idUser, idChannel: CHANNEL_1.idChannel },
                { idUser: userNotInChannel.idUser, idChannel: differentChannel.idChannel },
            ];

            await service['channelTable'].insert([CHANNEL_1, differentChannel]);
            await databaseService.knex.insert([userInChannel, userNotInChannel]).into(USER_TABLE);
            await service['userChatTable'].insert(userChannelTableExample);

            const result = await service.getChannelUserIds(CHANNEL_1.idChannel);

            expect(result).to.contain(userInChannel.idUser);
            expect(result).not.to.contain(userNotInChannel.idUser);
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

    // Decommnet tests when isChannelEmpty is used
    // describe('isChannelEmpty', () => {
    //     it('should return true if no user in channel', async () => {
    //         await channelTable().insert(CHANNEL_1);

    //         expect(await service['isChannelEmpty'](CHANNEL_1.idChannel)).to.be.true;
    //     });

    //     it('should return false if user in channel', async () => {
    //         await channelTable().insert(CHANNEL_1);
    //         await userTable().insert(USER);
    //         await userChannelTable().insert({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser });

    //         expect(await service['isChannelEmpty'](CHANNEL_1.idChannel)).to.be.false;
    //     });
    // });

    describe('getPublicChannels', () => {
        it('should return only public channels', async () => {
            await channelTable().insert([CHANNEL_1, { ...CHANNEL_2, private: true }]);
            await userTable().insert(USER);

            const channels = await service.getPublicChannels(USER.idUser);

            expect(channels).to.have.length(1);
            expect(channels[0].idChannel).to.equal(CHANNEL_1.idChannel);
        });

        it('should return only channels user is not in', async () => {
            await channelTable().insert([CHANNEL_1, CHANNEL_2]);
            await userTable().insert(USER);
            await userChannelTable().insert({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser });

            const channels = await service.getPublicChannels(USER.idUser);

            expect(channels).to.have.length(1);
            expect(channels[0].idChannel).to.equal(CHANNEL_2.idChannel);
        });
    })

    describe('deleteChannel', () => {
        it('should delete channel', async () => {
            await channelTable().insert(CHANNEL_1);

            await service.deleteChannel(CHANNEL_1.idChannel);

            expect(await channelTable().select().where({ idChannel: CHANNEL_1.idChannel })).to.have.length(0);
        });

        it('should delete channel history', async () => {
            await channelTable().insert(CHANNEL_1);

            chatHistoryService.deleteChannelHistory.resolves();

            await service.deleteChannel(CHANNEL_1.idChannel);

            expect(chatHistoryService.deleteChannelHistory.calledOnce).to.be.true;
        });

        it('should delete channel from userChannel', async () => {
            await channelTable().insert(CHANNEL_1);
            await userTable().insert(USER);
            await userChannelTable().insert({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser });

            await service.deleteChannel(CHANNEL_1.idChannel);

            expect(await userChannelTable().select().where({ idChannel: CHANNEL_1.idChannel, idUser: USER.idUser })).to.have.length(0);
        });
    })
});
