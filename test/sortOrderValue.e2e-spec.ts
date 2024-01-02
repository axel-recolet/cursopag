import { faker } from '@faker-js/faker';
import { Binary, Long } from 'bson';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Model, Schema, Types, mongo } from 'mongoose';
import { RankedValue, compare } from 'src/ranked-value';

describe('sortOrderValue', () => {
  let mongod: MongoMemoryServer;
  const thingSchema = new Schema(
    {
      key: Schema.Types.Mixed,
    },
    { minimize: false },
  );
  const thingModel = mongoose.model('Thing', thingSchema);

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = await mongod.getUri();

    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  describe('Second', () => {
    beforeEach(async () => {
      const rawDoc = [
        {
          _id: new Types.ObjectId('65802cd94e817a673d23b3ed'),
          key: {},
        },
        {
          _id: new Types.ObjectId('656c445f8625c3a5139d8ab8'),
          key: new Types.ObjectId('656af5887c8c1857eb0243e4'),
        },
        {
          _id: new Types.ObjectId('656c451243f9ea97a0fc09ed'),
          key: new Types.ObjectId('656aeafb7c8c1857eb0243e1'),
        },
        { _id: new Types.ObjectId('656c455651e4d795f68e781f'), key: null },
        { _id: new Types.ObjectId('656c44e73310d5a81211f3b3'), key: [] },
        { _id: new Types.ObjectId('656c4525894e5af013a981a9'), key: [2, 'a'] },
        { _id: new Types.ObjectId('656c450bb412bee400a21330'), key: [0, 'c'] },
        { _id: new Types.ObjectId('6580230fe066a3981649462a'), key: [true] },
        {
          _id: new Types.ObjectId('6571998af01409fddb01eb5a'),
          key: [
            new Types.ObjectId('657195e7f01409fddb01eb43'),
            new Types.Decimal128('9.888888888'),
          ],
        },
        {
          key: [true, 900],
        },
        {
          _id: new Types.ObjectId('6571998af01409fddb01eb5b'),
          key: [true, new Date('2023-12-07')],
        },
        { _id: new Types.ObjectId('656c454a20458cad4929ae04'), key: undefined },
        { _id: new Types.ObjectId('65802d8bf04bfd42ff540f92'), key: undefined },
        {
          _id: new Types.ObjectId('656c4551f92c05bb37456e70'),
          key: new Date('2023-12-02T06:53:00.478+02:00'),
        },
        {
          _id: new Types.ObjectId('656c4539773fe5bfc09a5ee8'),
          key: {
            foo: new Types.ObjectId('656aebbd7c8c1857eb0243e2'),
            bar: 'ZZZ',
          },
        },
        {
          _id: new Types.ObjectId('656c44f51fc63f3535ccee0d'),
          key: 5n,
        },
        {
          _id: new Types.ObjectId('656c45042dd0c30d01ff71a2'),
          key: new Types.Decimal128('6.89756985665'),
        },
        { _id: new Types.ObjectId('656c452d6b4d9dd1fb032f46'), key: 0.8489637 },
        {
          _id: new Types.ObjectId('656c45423a0585a7d3fc1714'),
          key: new RegExp('regexp', 'i'),
        },
        {
          _id: new Types.ObjectId('656c44fccafcf115369ef22b'),
          key: {
            foo: new Types.ObjectId('656aec047c8c1857eb0243e3'),
            bar: 'AAA',
          },
        },
        {
          _id: new Types.ObjectId('656c473cdd281b5a8171cdc0'),
          key: new Date('2023-12-03T06:53:00.478+02:00'),
        },
        { _id: new Types.ObjectId('656c474b8a68ff6cf09b0375'), key: true },
        {
          _id: new Types.ObjectId('656c472f0fb110cc534b4494'),
          key: Buffer.from('81fd547317474c9d8743f10642b3bb99', 'hex'),
        },
        { _id: new Types.ObjectId('656c471eaddd79c3d49b55d3'), key: false },
        { _id: new Types.ObjectId('656c474378bd6868960488a9'), key: 1 },
        { _id: new Types.ObjectId('656c4729e26be847c6674aa0'), key: 'b' },
      ];

      await thingModel.insertMany(rawDoc);
    });

    it('should sort ascending', async () => {
      const direction = 1;

      const mongooseResult = await thingModel
        .find()
        .sort({ key: direction })
        .lean();

      const comparisonResult = faker.helpers
        .shuffle(await thingModel.find().lean())
        .sort((a, b) => compare(a.key, b.key, direction));

      expect(comparisonResult).toIncludeSameSortedPartialMembers(
        mongooseResult,
      );
    });

    it('should sort descending', async () => {
      const direction: 1 | -1 = -1;

      const mongooseResult = await thingModel
        .find()
        .sort({ key: direction })
        .lean();

      const comparisonResult = faker.helpers
        .shuffle(await thingModel.find().lean())
        .sort((a, b) => compare(b.key, a.key, direction));

      expect(comparisonResult).toIncludeSameSortedPartialMembers(
        mongooseResult,
      );
    });
  });
});
