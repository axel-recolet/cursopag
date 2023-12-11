import { faker } from '@faker-js/faker';
import { rejects } from 'assert';
import { Decimal128, EJSON } from 'bson';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model, Schema, Types } from 'mongoose';
import { cursorEncoder } from 'src/encode-cursor';
import { skipCountForward } from 'src/skip-count-forward';

jest.setTimeout(50000);

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

function fakeRandomDocument() {
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

  const random = () =>
    faker.helpers.arrayElement([
      faker.helpers.objectValue(pre),
      undefined,
      null,
      [],
    ]);

  const mixed = random();
  const array = faker.helpers.multiple(() => random());
  const map = pre;
  const subSchema = {
    random: random(),
  };

  return {
    _id: new Types.ObjectId(),
    ...pre,
    mixed,
    array,
    map,
    subSchema,
  };
}

describe('skipCountForward function', () => {
  let mongod: MongoMemoryServer;
  let randomModel: Model<unknown>;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = await mongod.getUri();

    await mongoose.connect(mongoUri);

    randomModel = mongoose.model('random', ramdomSchema);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  it("should throw an error when the field isn't a key of the cursor", async () => {
    const result = skipCountForward({
      model: randomModel,
      filter: {},
      cursor: {
        _id: new Types.ObjectId(),
        string: 'string',
      },
      sort: [['noExistingKey', 1]],
      skipCursor: true,
    });

    expect(result).rejects.toThrow(`noExistingKey is not a key of cursor.`);
  });

  describe('String', () => {
    it('should return 1 when the cursor is in the collection and there is no other same value and skipCursor = true', async () => {
      const randomFakes = Array.from({ length: 5 }, () => fakeRandomDocument());
      await randomModel.insertMany(randomFakes);

      const mongooseResult = await randomModel.find().sort('string').lean();

      const result = await skipCountForward({
        model: randomModel,
        filter: {},
        sort: [
          ['string', 1],
          ['_id', 1],
        ],
        cursor: mongooseResult[3],
        skipCursor: true,
      });

      expect(result).toEqual(1);
    });

    it('should return 3 when the cursor is in the collection and there is others same values and skipCursor = true', async () => {
      const randomFakes = Array.from({ length: 3 }, () => fakeRandomDocument());

      let index = 0;
      randomFakes[2].number = index;
      const randomSameFakes = Array.from({ length: 2 }, (v, k) => ({
        ...fakeRandomDocument(),
        string: randomFakes[2].string,
        number: ++index,
      }));
      await randomModel.insertMany([...randomFakes, ...randomSameFakes]);

      const mongooseResult = await randomModel.find().sort('string').lean();

      const result = await skipCountForward({
        model: randomModel,
        filter: {},
        sort: [
          ['string', 1],
          ['number', 1],
          ['_id', 1],
        ],
        cursor: randomSameFakes[0],
        skipCursor: true,
      });

      expect(result).toEqual(2);
    });

    it('should return 3 when the cursor is in the collection and there is others same values and skipCursor = false', async () => {
      const randomFakes = Array.from({ length: 3 }, () => fakeRandomDocument());

      let index = 0;
      randomFakes[2].number = index;
      const randomSameFakes = Array.from({ length: 2 }, (v, k) => ({
        ...fakeRandomDocument(),
        string: randomFakes[2].string,
        number: ++index,
      }));
      await randomModel.insertMany([...randomFakes, ...randomSameFakes]);

      const mongooseResult = await randomModel.find().sort('string').lean();

      const result = await skipCountForward({
        model: randomModel,
        filter: {},
        sort: [
          ['string', 1],
          ['number', 1],
          ['_id', 1],
        ],
        cursor: randomSameFakes[0],
        skipCursor: false,
      });

      expect(result).toEqual(1);
    });
  });
});
