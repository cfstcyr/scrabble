// /* eslint-disable no-underscore-dangle */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable dot-notation */
// /* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// import { VirtualPlayerProfile, VirtualPlayerProfilesData } from '@app/classes/database/virtual-player-profile';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH } from '@app/constants/services-constants/mongo-db-const';
// import { NO_PROFILE_OF_LEVEL } from '@app/constants/services-errors';
// import DatabaseService from '@app/services/database-service/database.service';
// import { DatabaseServiceMock } from '@app/services/database-service/database.service.mock.spec';
// import { Random } from '@app/utils/random/random';
// import * as chai from 'chai';
// import { assert, expect } from 'chai';
// import * as chaiAsPromised from 'chai-as-promised';
// import { describe } from 'mocha';
// import * as mock from 'mock-fs'; // required when running test. Otherwise compiler cannot resolve fs, path and __dirname
// // import { WithId } from 'mongodb';
// import { join } from 'path';
// import * as sinon from 'sinon';
// import { stub } from 'sinon';
// // eslint-disable-next-line import/no-named-as-default
// import Container from 'typedi';
// import VirtualPlayerProfilesService from './virtual-player-profile.service';
// chai.use(chaiAsPromised); // this allows us to test for rejection

// const DEFAULT_PLAYER_ID_1 = 'player-id-1';
// const DEFAULT_PLAYER_ID_2 = 'player-id-2';

// const DEFAULT_PROFILE_1: VirtualPlayerProfile = {
//     name: 'Brun',
//     level: VirtualPlayerLevel.Beginner,
//     isDefault: true,
//     id: DEFAULT_PLAYER_ID_1,
// };

// const DEFAULT_PROFILE_2: VirtualPlayerProfile = {
//     name: 'Vert',
//     level: VirtualPlayerLevel.Expert,
//     isDefault: true,
//     id: DEFAULT_PLAYER_ID_2,
// };

// const CUSTOM_PROFILE_1: VirtualPlayerProfile = {
//     name: 'Rouge',
//     level: VirtualPlayerLevel.Beginner,
//     isDefault: false,
//     id: DEFAULT_PLAYER_ID_1,
// };

// const CUSTOM_PROFILE_2: VirtualPlayerProfile = {
//     name: 'Turquoise',
//     level: VirtualPlayerLevel.Expert,
//     isDefault: false,
//     id: DEFAULT_PLAYER_ID_2,
// };

// const DEFAULT_PROFILES: VirtualPlayerProfile[] = [DEFAULT_PROFILE_1, DEFAULT_PROFILE_2];
// const CUSTOM_PROFILES: VirtualPlayerProfile[] = [CUSTOM_PROFILE_1, CUSTOM_PROFILE_2];
// const ALL_PROFILES: VirtualPlayerProfile[] = DEFAULT_PROFILES.concat(CUSTOM_PROFILES);

// const mockInitialVirtualPlayerProfiles: VirtualPlayerProfilesData = {
//     virtualPlayerProfiles: ALL_PROFILES,
// };

// // mockPaths must be of type any because keys must be dynamic
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const mockPaths: any = [];
// mockPaths[join(__dirname, DEFAULT_VIRTUAL_PLAYER_PROFILES_RELATIVE_PATH)] = JSON.stringify(mockInitialVirtualPlayerProfiles);

// describe('VirtualPlayerProfilesService', () => {
//     let virtualPlayerProfilesService: VirtualPlayerProfilesService;
//     let databaseService: DatabaseService;

//     beforeEach(() => {
//         Container.reset();
//     });

//     beforeEach(async () => {
//         databaseService = Container.get(DatabaseServiceMock) as unknown as DatabaseService;
//         await databaseService.connectToServer();

//         Container.set(DatabaseService, databaseService);
//         virtualPlayerProfilesService = Container.get(VirtualPlayerProfilesService);

//         virtualPlayerProfilesService['databaseService'] = databaseService;
//         await virtualPlayerProfilesService['collection'].insertMany(ALL_PROFILES);
//     });

//     afterEach(async () => {
//         await databaseService.closeConnection();
//         chai.spy.restore();
//         sinon.restore();
//     });

//     describe('fetchDefaultVirtualPlayerProfiles', () => {
//         it('should get all profiles from JSON', async () => {
//             mock(mockPaths);
//             const virtualPlayerProfiles = await VirtualPlayerProfilesService['fetchDefaultVirtualPlayerProfiles']();
//             mock.restore();
//             expect(virtualPlayerProfiles.length).to.equal(ALL_PROFILES.length);
//         });
//     });

//     describe('getAllVirtualPlayerProfiles', () => {
//         it('should get all virtualPlayerProfiles from DB', async () => {
//             const virtualPlayerProfiles = await virtualPlayerProfilesService.getAllVirtualPlayerProfiles();
//             expect(virtualPlayerProfiles.length).to.equal(ALL_PROFILES.length);
//             expect(
//                 virtualPlayerProfiles.map((profile) => {
//                     return profile.name;
//                 }),
//             ).to.deep.equal(
//                 ALL_PROFILES.map((profile) => {
//                     return profile.name;
//                 }),
//             );
//         });
//     });

//     describe('getVirtualPlayerProfilesFromLevel', () => {
//         it('should get all profiles from DB of given level (beginner)', async () => {
//             const beginnerProfiles = await virtualPlayerProfilesService['getVirtualPlayerProfilesFromLevel'](VirtualPlayerLevel.Beginner);
//             expect(beginnerProfiles.length).to.equal(
//                 ALL_PROFILES.filter((profile: VirtualPlayerProfile) => profile.level === VirtualPlayerLevel.Beginner).length,
//             );
//             expect(beginnerProfiles).to.deep.equal([DEFAULT_PROFILE_1, CUSTOM_PROFILE_1]);
//         });

//         it('should get all profiles from DB of given level (expert)', async () => {
//             const expertProfiles = await virtualPlayerProfilesService['getVirtualPlayerProfilesFromLevel'](VirtualPlayerLevel.Expert);
//             expect(expertProfiles.length).to.equal(
//                 ALL_PROFILES.filter((profile: VirtualPlayerProfile) => profile.level === VirtualPlayerLevel.Expert).length,
//             );
//             expect(expertProfiles).to.deep.equal([DEFAULT_PROFILE_2, CUSTOM_PROFILE_2]);
//         });
//     });

//     describe('getRandomVirtualPlayerName', () => {
//         it('should call getRandomElementsFromArray and getVirtualPlayerProfilesFromLevel', async () => {
//             chai.spy.on(virtualPlayerProfilesService, 'getVirtualPlayerProfilesFromLevel', () => {
//                 return ALL_PROFILES;
//             });
//             chai.spy.on(Random, 'getRandomElementsFromArray', () => {
//                 return [DEFAULT_PROFILE_1];
//             });

//             expect(await virtualPlayerProfilesService['getRandomVirtualPlayerName'](VirtualPlayerLevel.Beginner)).to.equal(DEFAULT_PROFILE_1.name);
//         });

//         it('should throw if there is no profile of the desired level', async () => {
//             chai.spy.on(virtualPlayerProfilesService, 'getVirtualPlayerProfilesFromLevel', () => {
//                 return [];
//             });
//             chai.spy.on(Random, 'getRandomElementsFromArray', () => {
//                 return [];
//             });

//             await expect(virtualPlayerProfilesService['getRandomVirtualPlayerName'](VirtualPlayerLevel.Beginner)).to.eventually.be.rejectedWith(
//                 NO_PROFILE_OF_LEVEL,
//             );
//         });
//     });

//     describe('addVirtualPlayerProfile', () => {
//         it('should throw if new name is already used', async () => {
//             const spy = chai.spy.on(virtualPlayerProfilesService, 'isNameAlreadyUsed', () => true);
//             const newProfile: VirtualPlayerData = { name: 'name', isDefault: false } as unknown as VirtualPlayerData;
//             await expect(virtualPlayerProfilesService.addVirtualPlayerProfile(newProfile))
//                  .to.eventually.be.rejectedWith(NAME_ALREADY_USED('name'));
//             expect(spy).to.have.been.called();
//         });

//         it('should add a new profile if name valid and is not default', async () => {
//             const initialLength = (await virtualPlayerProfilesService.getAllVirtualPlayerProfiles()).length;
//             await virtualPlayerProfilesService.addVirtualPlayerProfile({ name: 'name', level: VirtualPlayerLevel.Beginner } as VirtualPlayerData);
//             const finalLength = (await virtualPlayerProfilesService.getAllVirtualPlayerProfiles()).length;
//             expect(finalLength).to.equal(initialLength + 1);
//         });
//     });

//     describe('updateVirtualPlayerProfile', () => {
//         it('should throw if new name is already used', async () => {
//             const spy = chai.spy.on(virtualPlayerProfilesService, 'isNameAlreadyUsed', () => true);
//             await expect(virtualPlayerProfilesService.updateVirtualPlayerProfile('name', 'id')).to.eventually.be.rejectedWith(
//                 NAME_ALREADY_USED('name'),
//             );
//             expect(spy).to.have.been.called();
//         });

//         it('should update the profile if it is not a default one', async () => {
//             const profileToModify: WithId<VirtualPlayerProfile> = (
//                 await virtualPlayerProfilesService['collection'].find({ name: CUSTOM_PROFILE_1.name }).toArray()
//             )[0];
//             const newName = 'joli joli';

//             await virtualPlayerProfilesService.updateVirtualPlayerProfile(newName, profileToModify._id.toString());
//             const result: WithId<VirtualPlayerProfile> = (
//                 await virtualPlayerProfilesService['collection'].find({ _id: profileToModify._id }).toArray()
//             )[0];

//             expect(result.name).to.equal(newName);
//             expect(result.level).to.equal(CUSTOM_PROFILE_1.level);
//             expect(result.isDefault).to.equal(CUSTOM_PROFILE_1.isDefault);
//             expect(result._id).to.deep.equal(profileToModify._id);
//         });

//         it('should not update the profile if it is a default one', async () => {
//             const profileToModify: WithId<VirtualPlayerProfile> = (
//                 await virtualPlayerProfilesService['collection'].find({ name: DEFAULT_PROFILE_1.name }).toArray()
//             )[0];
//             const newName = 'joli joli';

//             await virtualPlayerProfilesService.updateVirtualPlayerProfile(newName, profileToModify._id.toString());
//             const result: WithId<VirtualPlayerProfile> = (
//                 await virtualPlayerProfilesService['collection'].find({ _id: profileToModify._id }).toArray()
//             )[0];

//             expect(result.name).to.equal(DEFAULT_PROFILE_1.name);
//             expect(result.name).not.to.equal(newName);
//             expect(result.level).to.equal(DEFAULT_PROFILE_1.level);
//             expect(result.isDefault).to.equal(DEFAULT_PROFILE_1.isDefault);
//             expect(result._id).to.deep.equal(profileToModify._id);
//         });
//     });

//     describe('deleteVirtualPlayerProfile', () => {
//         it('should delete profile if is it not default', async () => {
//             const profileToDelete: WithId<VirtualPlayerProfile> = (
//                 await virtualPlayerProfilesService['collection'].find({ name: CUSTOM_PROFILE_2.name }).toArray()
//             )[0];
//             virtualPlayerProfilesService.deleteVirtualPlayerProfile(profileToDelete._id.toString());
//             expect((await virtualPlayerProfilesService.getAllVirtualPlayerProfiles()).length).to.equal(ALL_PROFILES.length - 1);
//         });

//         it('should NOT delete profile if is it a default', async () => {
//             const profileToDelete: WithId<VirtualPlayerProfile> = (
//                 await virtualPlayerProfilesService['collection'].find({ name: DEFAULT_PROFILE_2.name }).toArray()
//             )[0];
//             virtualPlayerProfilesService.deleteVirtualPlayerProfile(profileToDelete._id.toString());
//             expect((await virtualPlayerProfilesService.getAllVirtualPlayerProfiles()).length).to.equal(ALL_PROFILES.length);
//         });
//     });

//     describe('resetVirtualPlayerProfiles', () => {
//         it('should call populateDb', async () => {
//             const spy = chai.spy.on(virtualPlayerProfilesService, 'populateDb', () => {});
//             await virtualPlayerProfilesService.resetVirtualPlayerProfiles();
//             expect(spy).to.have.been.called();
//         });

//         it('should delete all documents of the array', async () => {
//             chai.spy.on(virtualPlayerProfilesService, 'populateDb', () => {});
//             await virtualPlayerProfilesService.resetVirtualPlayerProfiles();

//             expect((await virtualPlayerProfilesService.getAllVirtualPlayerProfiles()).length).to.equal(DEFAULT_PROFILES.length);
//         });
//     });

//     describe('populateDb', () => {
//         it('should call databaseService.populateDb and fetchDefaultHighScores', async () => {
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
//             const spyFetchDefaultProfiles = stub(VirtualPlayerProfilesService, <any>'fetchDefaultVirtualPlayerProfiles');
//             const spyPopulateDb = chai.spy.on(virtualPlayerProfilesService['databaseService'], 'populateDb', () => {});
//             await virtualPlayerProfilesService['populateDb']();
//             expect(spyPopulateDb).to.have.been.called();
//             assert(spyFetchDefaultProfiles.calledOnce);
//         });
//     });

//     describe('isNameAlreadyUsed', () => {
//         it('should return true if the name is already used', async () => {
//             expect(await virtualPlayerProfilesService['isNameAlreadyUsed'](CUSTOM_PROFILE_2.name)).to.be.true;
//         });

//         it('should return false if the name is not already used', async () => {
//             expect(await virtualPlayerProfilesService['isNameAlreadyUsed']('mathiloulilou')).to.be.false;
//         });
//     });
// });
