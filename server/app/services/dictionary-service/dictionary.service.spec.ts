/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { Dictionary, DictionaryData } from '@app/classes/dictionary';
import { assert, expect } from 'chai';
import { Container } from 'typedi';
import DictionaryService, { DictionaryUpdateInfo, DictionaryUsage } from './dictionary.service';
import { join } from 'path';
import * as mock from 'mock-fs';
import { MongoClient, WithId } from 'mongodb';
import { ValidateFunction } from 'ajv';
import * as chai from 'chai';

import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import DatabaseService from '@app/services/database-service/database.service';
import { DatabaseServiceMock } from '@app/services/database-service/database.service.mock.spec';
import { DICTIONARY_PATH } from '@app/constants/dictionary.const';
import { stub } from 'sinon';
import {
    ADDITIONNAL_PROPERTY_DICTIONARY,
    DICTIONARY_1,
    DICTIONARY_2,
    DICTIONARY_3,
    INITIAL_DICTIONARIES,
    INVALID_ARRAY_TYPES_DICTIONARY,
    INVALID_TYPES_DICTIONARY,
    INVALID_WORDS_DICTIONARY_1,
    INVALID_WORDS_DICTIONARY_2,
    INVALID_WORDS_DICTIONARY_3,
    INVALID_WORDS_DICTIONARY_4,
    INVALID_WORDS_DICTIONARY_5,
    INVALID_WORDS_DICTIONARY_6,
    LONG_TITLE_DICTIONARY,
    MISSING_PROPERTY_DICTIONARY,
    NEW_INVALID_DICTIONARY,
    NEW_VALID_DICTIONARY,
    SAME_TITLE_DICTIONARY,
    VALID_DICTIONARY,
} from './dictionary-test.service.spec';
chai.use(chaiAsPromised); // this allows us to test for rejection

// mockPaths must be of type any because keys must be dynamic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPaths: any = [];
mockPaths[join(__dirname, DICTIONARY_PATH)] = JSON.stringify(DICTIONARY_1);

describe.only('DictionaryService', () => {
    let dictionaryService: DictionaryService;
    let databaseService: DatabaseService;
    let client: MongoClient;

    beforeEach(async () => {
        databaseService = Container.get(DatabaseServiceMock) as unknown as DatabaseService;
        client = (await databaseService.connectToServer()) as MongoClient;
        dictionaryService = Container.get(DictionaryService);
        dictionaryService['databaseService'] = databaseService;
        await dictionaryService['collection'].insertMany(INITIAL_DICTIONARIES);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        chai.spy.restore();
    });

    describe('fetchDefaultDictionary', () => {
        it('should get all courses from JSON', async () => {
            mock(mockPaths);
            const dictionaries = await DictionaryService['fetchDefaultDictionary']();
            mock.restore();
            expect(dictionaries.title).to.deep.equal(DICTIONARY_1.title);
        });
    });

    describe('validateDictionary', () => {
        it('should create the dictionary validator if it was not done before', async () => {
            dictionaryService['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(dictionaryService, 'createDictionaryValidator', () => {
                dictionaryService['dictionaryValidator'] = ((x: string) => {
                    return x;
                }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            });

            await dictionaryService.validateDictionary(DICTIONARY_1);
            expect(spyCreate).to.have.been.called;
        });

        it('should not create the dictionary validator if was not done before', async () => {
            dictionaryService['dictionaryValidator'] = dictionaryService['dictionaryValidator'] = ((x: string) => {
                return x;
            }) as unknown as ValidateFunction<{ [x: string]: unknown }>;
            const spyCreate = chai.spy.on(dictionaryService, 'createDictionaryValidator', () => {});

            await dictionaryService.validateDictionary(DICTIONARY_1);
            expect(spyCreate).not.to.have.been.called;
        });
    });

    describe('addNewDictionary', () => {
        it('should throw if the dictionary is not valid ', async () => {
            dictionaryService['dictionaryValidator'] = undefined as unknown as ValidateFunction<{ [x: string]: unknown }>;
            chai.spy.on(dictionaryService, 'validateDictionary', () => false);

            expect(dictionaryService.addNewDictionary({} as unknown as DictionaryData)).to.eventually.be.rejectedWith(Error);
        });

        it('should add the dictionary if the title is unique', async () => {
            chai.spy.on(dictionaryService, 'validateDictionary', () => true);

            await dictionaryService.addNewDictionary(NEW_VALID_DICTIONARY);
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(INITIAL_DICTIONARIES.length + 1);
            expect((await dictionaryService['collection'].find({ title: NEW_VALID_DICTIONARY.title }).toArray())[0].description).to.deep.equal(
                NEW_VALID_DICTIONARY.description,
            );
        });

        it('should not add the dictionary if the title is already present', async () => {
            chai.spy.on(dictionaryService, 'validateDictionary', () => true);

            await dictionaryService.addNewDictionary(NEW_INVALID_DICTIONARY);
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(INITIAL_DICTIONARIES.length);
            expect((await dictionaryService['collection'].find({ title: NEW_INVALID_DICTIONARY.title }).toArray())[0].description).not.to.deep.equal(
                NEW_INVALID_DICTIONARY.description,
            );
        });
    });

    describe('resetDbDictionaries', () => {
        it('should call populateDb if the collection has no default dictionaries ', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(dictionaryService, 'populateDb', () => {});
            await dictionaryService['collection'].deleteMany({ isDefault: { $exists: true } });
            await dictionaryService.resetDbDictionaries();
            expect(spy).to.have.been.called;
        });

        it('should not call populateDb if the collection has a default dictionary ', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const spy = chai.spy.on(dictionaryService, 'populateDb', () => {});
            await dictionaryService.resetDbDictionaries();
            expect(spy).not.to.have.been.called;
        });

        it('should only leave the default dictionary', async () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            chai.spy.on(dictionaryService, 'populateDb', () => {});
            await dictionaryService.resetDbDictionaries();
            expect((await dictionaryService['collection'].find({}).toArray()).length).to.equal(1);
            expect((await dictionaryService['collection'].find({}).toArray())[0].title).to.equal(DICTIONARY_1.title);
        });
    });

    describe('getDictionarySummaryTitles', () => {
        it('should return the list with only the wanted attributes', async () => {
            const result = await dictionaryService.getDictionarySummaryTitles();
            expect(result.length).to.equal(INITIAL_DICTIONARIES.length);
            expect(result[0].description).to.equal(INITIAL_DICTIONARIES[0].description);
        });
    });

    describe('updateDictionary', () => {
        it('should update the dictionary if it is not a default one and legal', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifieddescription', title: 'modifiedTitle' };

            await dictionaryService.updateDictionary(updateInfo);

            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(updateInfo.title);
            expect(result.description).to.equal(updateInfo.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should update the dictionary if it is not a default one and legal (only new title)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), title: 'modifiedTitle' };

            await dictionaryService.updateDictionary(updateInfo);
            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(updateInfo.title);
            expect(result.description).to.equal(DICTIONARY_2.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should not update the dictionary if it is a default one and legal', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_1.title }).toArray())[0];

            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifieddescription', title: 'modifiedTitle' };
            await dictionaryService.updateDictionary(updateInfo);
            const result: WithId<DictionaryData> = (await dictionaryService['collection'].find({ _id: dictToModify._id }).toArray())[0];

            expect(result.title).to.equal(DICTIONARY_1.title);
            expect(result.description).to.equal(DICTIONARY_1.description);
            expect(result._id).to.deep.equal(dictToModify._id);
        });

        it('should throw if the data is invalid (description)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            chai.spy.on(dictionaryService, 'isDescriptionValid', () => false);
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), description: 'modifieddescription' };
            expect(dictionaryService.updateDictionary(updateInfo)).to.eventually.be.rejectedWith(Error);
        });

        it('should throw if the data is invalid (title)', async () => {
            const dictToModify: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];
            chai.spy.on(dictionaryService, 'isTitleValid', () => false);
            const updateInfo: DictionaryUpdateInfo = { id: dictToModify._id.toString(), title: 'modifiedTitle' };
            expect(dictionaryService.updateDictionary(updateInfo)).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('isTitleValid', () => {
        it('should return true if the title is unique and short', async () => {
            expect(await dictionaryService['isTitleValid']('uniquetitle')).to.be.true;
        });
        it('should return false if the title is not unique and short', async () => {
            expect(await dictionaryService['isTitleValid'](DICTIONARY_3.title)).to.be.false;
        });

        it('should return false if the title is unique and long', async () => {
            expect(await dictionaryService['isTitleValid']('uniquqweqweqweqweqweqwewqqweetitle')).to.be.false;
        });
    });

    describe('isDescriptionValid', () => {
        it('should return true if the description is short', async () => {
            expect(dictionaryService['isDescriptionValid']('shortdescription')).to.be.true;
        });

        it('should return false if the description is unique and long', () => {
            expect(
                dictionaryService['isDescriptionValid'](
                    `uniquqweqweqweqweqweqwewqqweedescriptionsdaofhdsfjsdhfosdhfosdfhsdohfsdhifoihsdfhiosdhiofsdihfhidsiohf
                    hdsifhisdoihfhdsifihodsihfhisdhiofsdih`,
                ),
            ).to.be.false;
        });
    });

    describe('populateDb', () => {
        it('should call databaseService.populateDb and fetchDefaultDictionary', async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
            const spyFetchDefaultHighScores = stub(DictionaryService, <any>'fetchDefaultDictionary');
            const spyPopulateDb = chai.spy.on(dictionaryService['databaseService'], 'populateDb', () => {});
            await dictionaryService['populateDb']();
            expect(spyPopulateDb).to.have.been.called;
            assert(spyFetchDefaultHighScores.calledOnce);
        });
    });

    describe('getDbDictionary', () => {
        it('should return the wanted dictionary with a valid id', async () => {
            const dictToGet: WithId<DictionaryData> = (await dictionaryService['collection'].find({ title: DICTIONARY_2.title }).toArray())[0];

            const result = await dictionaryService['getDbDictionary'](dictToGet._id.toString());
            expect(result.title).to.equal(DICTIONARY_2.title);
            expect(result.description).to.equal(DICTIONARY_2.description);
        });

        it('should throw with a invalid id', async () => {
            expect(dictionaryService['getDbDictionary']('badid')).to.eventually.be.rejectedWith(Error);
        });
    });

    describe('createDictionaryValidator', () => {
        const dictionaryToTest: [DictionaryData, boolean, string][] = [
            [VALID_DICTIONARY, true, 'VALID_DICTIONARY'],
            [INVALID_TYPES_DICTIONARY, false, 'INVALID_TYPES_DICTIONARY'],
            [LONG_TITLE_DICTIONARY, false, 'LONG_TITLE_DICTIONARY'],
            [MISSING_PROPERTY_DICTIONARY, false, 'MISSING_PROPERTY_DICTIONARY'],
            [SAME_TITLE_DICTIONARY, false, 'SAME_TITLE_DICTIONARY'],
            [INVALID_ARRAY_TYPES_DICTIONARY, false, 'INVALID_ARRAY_TYPES_DICTIONARY'],
            [ADDITIONNAL_PROPERTY_DICTIONARY, false, 'ADDITIONNAL_PROPERTY_DICTIONARY'],
            [INVALID_WORDS_DICTIONARY_1, false, 'INVALID_WORDS_DICTIONARY_1'],
            [INVALID_WORDS_DICTIONARY_2, false, 'INVALID_WORDS_DICTIONARY_2'],
            [INVALID_WORDS_DICTIONARY_3, false, 'INVALID_WORDS_DICTIONARY_3'],
            [INVALID_WORDS_DICTIONARY_4, false, 'INVALID_WORDS_DICTIONARY_4'],
            [INVALID_WORDS_DICTIONARY_5, false, 'INVALID_WORDS_DICTIONARY_5'],
            [INVALID_WORDS_DICTIONARY_6, false, 'INVALID_WORDS_DICTIONARY_6'],
        ];

        for (const test of dictionaryToTest) {
            it(`should return ${test[1]} for a ${test[2]}`, async () => {
                expect(await dictionaryService['validateDictionary'](test[0])).to.equal(test[1]);
            });
        }
    });

    describe('useDictionary', async () => {
        const BASE_DICTIONARY_USAGE: DictionaryUsage = { dictionary: {} as unknown as Dictionary, numberOfActiveGames: 1 };
        const BASE_DICTIONARY_ID = 'id1';
        beforeEach(async () => {
            dictionaryService['activeDictionaries'].set(BASE_DICTIONARY_ID, BASE_DICTIONARY_USAGE);
        });

        it('should create the dictionary validator if it was not done before', async () => {
            const spy = chai.spy.on(dictionaryService, 'getDbDictionary', () => {
                return {} as unknown as DictionaryData;
            });

            expect(dictionaryService.useDictionary(BASE_DICTIONARY_ID)).to.deep.equal(BASE_DICTIONARY_USAGE);
            expect(BASE_DICTIONARY_USAGE.numberOfActiveGames).to.equal(2);
            expect(spy).to.have.called();
        });
    });

    // beforeEach(() => {
    //     mock(mockPaths);
    //     Container.reset();
    //     dictionaryService = Container.get(DictionaryService);
    //     // title = dictionaryService.getDictionaryTitles()[0];
    // });

    // afterEach(() => {
    //     mock.restore();
    // });

    // describe('constructor', () => {
    //     dictionaryService['coll'];
    // });
    // describe('getDictionary', () => {
    //     it('should return dictionary if it exists', () => {
    //         const result = dictionaryService.getDictionary(title);
    //         expect(result).to.exist;
    //     });

    //     it("should throw if it doesn't exists", () => {
    //         expect(() => dictionaryService.getDictionary('invalid dictionary')).to.throw(INVALID_DICTIONARY_NAME);
    //     });
    // });

    // describe('getDefaultDictionary', () => {
    //     it('should call getDictionary with first getDictionaryTitles value', () => {
    //         const testTitle = 'test title';
    //         stub(dictionaryService, 'getDictionaryTitles').returns([testTitle]);
    //         const getDictionaryStub = stub(dictionaryService, 'getDictionary');

    //         dictionaryService.getDefaultDictionary();

    //         expect(getDictionaryStub.calledWith(testTitle));
    //     });
    // });

    // describe('addAllDictionaries', () => {
    //     let fetchDictionaryWordsStub: SinonStub;

    //     beforeEach(() => {
    //         dictionaryService['dictionaryPaths'] = TEST_PATHS;
    //         fetchDictionaryWordsStub = stub<DictionaryService, any>(dictionaryService, 'fetchDictionaryWords').callsFake((path: string) => {
    //             const index = TEST_PATHS.indexOf(path);
    //             return new Dictionary({ ...TEST_DICTIONARY, title: `dictionary_${index}` });
    //         });
    //     });

    //     it('should call fetchDictionaryWordsStub n times', () => {
    //         dictionaryService['addAllDictionaries']();

    //         expect(fetchDictionaryWordsStub.callCount).to.equal(TEST_PATHS.length);
    //     });

    //     it('should have n dictionaries in set after', () => {
    //         dictionaryService['dictionaries'] = new Map();
    //         dictionaryService['addAllDictionaries']();

    //         expect(dictionaryService['dictionaries'].size).to.equal(TEST_PATHS.length);
    //     });
    // });

    // describe('fetchDictionaryWords', () => {
    //     it('should return dictionary', () => {
    //         const result = dictionaryService['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

    //         expect(result).to.exist;
    //     });

    //     it('should return dictionary with words', () => {
    //         const result = dictionaryService['fetchDictionaryWords'](DICTIONARY_PATHS[0]);

    //         for (const word of TEST_DICTIONARY.words) {
    //             expect(result.wordExists(word)).to.be.true;
    //         }
    //     });
    // });

    describe('Error handling', async () => {
        it('should throw an error if we try to access the database on a closed connection', async () => {
            await client.close();
            expect(dictionaryService['getDictionarySummaryTitles']()).to.eventually.be.rejectedWith(Error);
        });
    });
});
