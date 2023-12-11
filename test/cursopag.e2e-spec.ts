import mongoose, { Model, Types, Schema } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { cursopag } from 'src/index';

jest.setTimeout(50000);

import {
  Planet,
  PlanetSchema,
  fakePlanetDocument,
  mars,
  mercury,
  neptune,
  planets,
  uranus,
} from './planet';
import { cursorEncoder } from 'src/encode-cursor';
import { Decimal128, EJSON } from 'bson';
import { faker } from '@faker-js/faker';

describe('cursopag', () => {
  let mongod: MongoMemoryServer;
  let planetModel: Model<Planet>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = await mongod.getUri();

    await mongoose.connect(mongoUri);

    planetModel = mongoose.model<Planet>(Planet.name, PlanetSchema);

    await planetModel.insertMany(planets);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('first sorted by ascending _id (unique)', () => {
    const filter = {};
    let mongooseResult: Record<string, unknown>[];

    beforeEach(async () => {
      mongooseResult = await planetModel.find(filter).lean();
    });

    it('should return 1th to 3th planets', async () => {
      const first = 3;
      const result = await cursopag({
        model: planetModel,
        filter,
        first,
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(first);

      expect(result.edges[0].node.name).toEqual(mongooseResult[0].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[1].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[2].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[0] as any)._id) },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[2] as any)._id) },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: false,
        hasNextPage: true,
      });
    });

    it('should return 4th to 6th planets', async () => {
      const first = 3;
      const result = await cursopag({
        model: planetModel,
        filter,
        first,
        after: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[2] as any)._id) },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(first);

      expect(result.edges[0].node.name).toEqual(mongooseResult[3].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[4].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[5].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[3] as any)._id) },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[5] as any)._id) },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });

    it('should return 7th to 8th planets', async () => {
      const first = 3;
      const result = await cursopag({
        model: planetModel,
        filter,
        first,
        after: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[5] as any)._id) },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(2);

      expect(result.edges[0].node.name).toEqual(mongooseResult[6].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[7].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[6] as any)._id) },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            { _id: new Types.ObjectId((mongooseResult[7] as any)._id) },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: false,
      });

      expect(result.edges[0].node.name).toEqual(uranus.name);
      expect(result.edges[1].node.name).toEqual(neptune.name);

      expect(
        result.edges[0].node._id.toHexString() <
          result.edges[1].node._id.toHexString(),
      ).toBeTruthy();
    });
  });

  describe('last 4 sorted by descending isTerrestrial (not unique field and not selected by default) and ascending name', () => {
    const filter = {};
    const sort = `-isTerrestrial name`;
    let mongooseResult: Record<string, unknown>[];

    beforeEach(async () => {
      mongooseResult = await planetModel
        .find(filter)
        .select('+isTerrestrial')
        .sort(sort)
        .lean();
    });

    it('should return 4 planets', async () => {
      const last = 4;

      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        last,
      });

      expect(result.totalCount).toEqual(mongooseResult.length);

      expect(result.edges).toHaveLength(last);

      expect(result.edges[0].node.name).toEqual(mongooseResult[4].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[5].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[6].name);
      expect(result.edges[3].node.name).toEqual(mongooseResult[7].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[4]._id,
              name: mongooseResult[4].name,
              isTerrestrial: mongooseResult[4].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[7]._id,
              name: mongooseResult[7].name,
              isTerrestrial: mongooseResult[7].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: false,
      });
    });

    it('should return last 4 planets before Jupiter', async () => {
      const last = 4;

      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        last,
        before: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[4]._id,
              name: mongooseResult[4].name,
              isTerrestrial: mongooseResult[4].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(last);

      expect(result.edges[0].node.name).toEqual(mongooseResult[0].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[1].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[2].name);
      expect(result.edges[3].node.name).toEqual(mongooseResult[3].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[0]._id,
              name: mongooseResult[0].name,
              isTerrestrial: mongooseResult[0].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[3]._id,
              name: mongooseResult[3].name,
              isTerrestrial: mongooseResult[3].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: false,
        hasNextPage: true,
      });
    });

    it('should return first 4 planets after the second result', async () => {
      const first = 4;
      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        first,
        after: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[1]._id,
              name: mongooseResult[1].name,
              isTerrestrial: mongooseResult[1].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(first);

      expect(result.edges[0].node.name).toEqual(mongooseResult[2].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[3].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[4].name);
      expect(result.edges[3].node.name).toEqual(mongooseResult[5].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[2]._id,
              name: mongooseResult[2].name,
              isTerrestrial: mongooseResult[2].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[5]._id,
              name: mongooseResult[5].name,
              isTerrestrial: mongooseResult[5].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });

    it('should return first 4 planets after the five result', async () => {
      const first = 4;
      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        first,
        after: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[5]._id,
              name: mongooseResult[5].name,
              isTerrestrial: mongooseResult[5].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(2);

      expect(result.edges[0].node.name).toEqual(mongooseResult[5].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[7].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[2]._id,
              name: mongooseResult[2].name,
              isTerrestrial: mongooseResult[2].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[5]._id,
              name: mongooseResult[5].name,
              isTerrestrial: mongooseResult[5].isTerrestrial,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });
  });

  describe('Filter', () => {
    const filter = {
      name: {
        $gt: mars.name,
      },
    };
    const sort = `-name`;
    let mongooseResult: Record<string, unknown>[];

    beforeEach(async () => {
      mongooseResult = await planetModel.find(filter).sort(sort).lean();
    });

    it('should filter and sort data, last 2 before cursor', async () => {
      expect(mongooseResult[4].name).toEqual(mercury.name);

      const last = 3;
      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        last,
        before: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[4]._id,
              name: mongooseResult[4].name,
            },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(last);

      expect(result.edges[0].node.name).toEqual(mongooseResult[1].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[2].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[3].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[1]._id,
              name: mongooseResult[1].name,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[3]._id,
              name: mongooseResult[3].name,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });
  });

  describe('Equality near the cursor', () => {
    it('should return first 3 and hasPreviousPage = true when the cursor have equality mainStortedField', async () => {
      let fakeEquatorialRadius = 0;
      const fakePlanets = faker.helpers.multiple(
        () =>
          fakePlanetDocument({
            gravity: 0,
            equatorialRadius: fakeEquatorialRadius++,
          }),
        { count: 5 },
      );
      await planetModel.insertMany(fakePlanets);

      const filter = {};
      const sort = `gravity equatorialRadius`;
      const mongooseResult = await planetModel.find(filter).sort(sort).lean();

      const first = 3;
      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        first,
        after: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[0]._id,
              gravity: mongooseResult[0].gravity,
              equatorialRadius: mongooseResult[0].equatorialRadius,
            },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);

      expect(result.edges).toHaveLength(first);

      expect(result.edges[0].node.name).toEqual(mongooseResult[1].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[2].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[3].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[1]._id,
              equatorialRadius: mongooseResult[1].equatorialRadius,
              gravity: mongooseResult[1].gravity,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[3]._id,
              equatorialRadius: mongooseResult[3].equatorialRadius,
              gravity: mongooseResult[3].gravity,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });

    it('should return last 3 and hasNextPage = true when the cursor have equality mainStortedField', async () => {
      let fakeEquatorialRadius = 0;
      const fakePlanets = faker.helpers.multiple(
        () =>
          fakePlanetDocument({
            gravity: 30,
            equatorialRadius: fakeEquatorialRadius++,
          }),
        { count: 5 },
      );
      await planetModel.insertMany(fakePlanets);

      const filter = {};
      const sort = `gravity equatorialRadius`;
      const mongooseResult = await planetModel.find(filter).sort(sort).lean();

      const last = 3;
      const result = await cursopag({
        model: planetModel,
        filter,
        sort,
        last,
        before: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[12]._id,
              equatorialRadius: mongooseResult[12].equatorialRadius,
              gravity: mongooseResult[12].gravity,
            },
            { relaxed: false },
          ),
        ),
      });

      expect(result.totalCount).toEqual(mongooseResult.length);
      expect(result.edges).toHaveLength(last);

      expect(result.edges[0].node.name).toEqual(mongooseResult[9].name);
      expect(result.edges[1].node.name).toEqual(mongooseResult[10].name);
      expect(result.edges[2].node.name).toEqual(mongooseResult[11].name);

      expect(result.pageInfo).toEqual({
        startCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[9]._id,
              equatorialRadius: mongooseResult[9].equatorialRadius,
              gravity: mongooseResult[9].gravity,
            },
            { relaxed: false },
          ),
        ),
        endCursor: cursorEncoder(
          EJSON.stringify(
            {
              _id: mongooseResult[11]._id,
              equatorialRadius: mongooseResult[11].equatorialRadius,
              gravity: mongooseResult[11].gravity,
            },
            { relaxed: false },
          ),
        ),
        hasPreviousPage: true,
        hasNextPage: true,
      });
    });
  });

  describe('Name of the group', () => {
    const subSchema = new Schema({
      random: { type: Schema.Types.Mixed },
    });

    const ramdomSchema = new Schema({
      string: { type: String },
      number: { type: Number },
      bigInt: { type: BigInt },
      decimal128: { type: Decimal128 },
      date: { type: Date },
      buffer: { type: Buffer },
      boolean: { type: Boolean },
      mixed: { type: Schema.Types.Mixed },
      objectId: { type: Schema.Types.ObjectId },
      array: { type: [Schema.Types.Mixed] },
      map: { type: Map, of: Schema.Types.Mixed },
      subSchema: { type: subSchema },
      uuid: { type: Schema.Types.UUID },
    });

    const fakeRandomDocument = () => {
      const pre: any = {
        string: faker.string.sample(),
        number: faker.helpers.arrayElement([
          faker.number.int(),
          faker.number.float(),
        ]),
        bigInt: faker.number.bigInt(),
        decimal128: new Types.Decimal128(faker.number.float().toString()),
        date: faker.date.anytime(),
        buffer: Buffer.from(faker.string.sample()),
        boolean: faker.datatype.boolean(),
        objectId: new Types.ObjectId(faker.database.mongodbObjectId()),
        uuid: faker.string.uuid(),
      };

      const random = () => faker.helpers.objectValue(pre);

      const mixed = random();
      const array = faker.helpers.multiple(() => random());
      const map = pre;
      const subSchema = {
        random: random(),
      };

      return {
        ...pre,
        mixed,
        array,
        map,
        subSchema,
      };
    };

    const randomModel = mongoose.model('random', ramdomSchema);

    beforeEach(async () => {
      const randomDocs = faker.helpers.multiple(() => fakeRandomDocument(), {
        count: 20,
      });
      await randomModel.insertMany(randomDocs);
    });

    it('should ', async () => {
      // faker.seed(2380883256909582);
      const sort = ['array']; /*faker.helpers.multiple(
        () => faker.helpers.objectKey(fakeRandomDocument()).toString(),
        { count: 2 },
      );*/
      const sortDir = '-array'; /*sort
        .map((v) => `${faker.datatype.boolean() ? '-' : ''}${v}`)
        .join(' ');*/

      const mongooseResult = await randomModel.find().sort(sortDir).lean();
      const cursorIndex = 0; //faker.number.int({ min: 0, max: 20 });
      const cursor = (() => {
        const raw: Record<string, unknown> = {
          _id: mongooseResult[cursorIndex]._id,
        };

        for (const field of sort) {
          raw[field] = (mongooseResult[cursorIndex] as any)[field];
        }

        return cursorEncoder(EJSON.stringify(raw, { relaxed: false }));
      })();
      const requestLength = faker.number.int({ min: 1, max: 5 });

      const direction =
        /*faker.helpers.arrayElement([*/
        /*{
          last: requestLength,
          before: cursor,
        }; */
        {
          first: requestLength,
          after: cursor,
        };
      /*]);*/

      const result = await (async () => {
        try {
          return await cursopag({
            model: randomModel,
            filter: {},
            sort: sortDir,
            ...direction,
            queryOptions: {
              lean: true,
            },
          });
        } catch (error) {
          console.error(error);
          console.log('seed', faker.seed());
        }
      })();

      console.log(sortDir);
    });
  });
});
