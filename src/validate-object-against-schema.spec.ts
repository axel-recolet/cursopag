import { faker } from '@faker-js/faker';
import * as uuid from 'uuid';
import mongoose, { Mongoose, Schema, SchemaType } from 'mongoose';
import {
  validateObjectAgainstSchema,
  validatePathType,
} from './validate-object-against-schema';

import { PlanetDocument, PlanetSchema } from '../test/planet';

describe('validatePathType', () => {
  describe('Required', () => {
    it('should return false when value is required but not present', async () => {
      const schema = new Schema({
        name: {
          type: String,
          required: true,
        },
      });

      const result = validatePathType('name', undefined, schema);

      expect(result).toBeFalsy();
    });
  });

  describe('String', () => {
    it('should return false when it is not a string', async () => {
      const schema = new Schema({ name: String });

      const value = 34;

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a string', async () => {
      const schema = new Schema({ name: String });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('UUID', () => {
    const schema = new Schema({ name: mongoose.Schema.Types.UUID });
    it('should return false when it is not a UUID', async () => {
      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a UUID', async () => {
      const value = uuid.v5('www.cursopag.net', uuid.v5.URL);

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('Number', () => {
    it('should return false when it is not a number', async () => {
      const schema = new Schema({ name: Number });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a number', async () => {
      const schema = new Schema({ name: Number });

      const value = 34;

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('bigint', () => {
    it('should return false when it is not a bigint', async () => {
      const schema = new Schema({ name: BigInt });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a bigint', async () => {
      const schema = new Schema({ name: BigInt });

      const value = 34n;

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('Decimal128', () => {
    it('should return false when it is not a Decimal128', async () => {
      const schema = new Schema({ name: mongoose.Schema.Types.Decimal128 });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a Decimal128', async () => {
      const schema = new Schema({ name: mongoose.Schema.Types.Decimal128 });

      const value = new mongoose.Types.Decimal128('3.1415');

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('boolean', () => {
    it('should return false when it is not a boolean', async () => {
      const schema = new Schema({ name: Boolean });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a boolean', async () => {
      const schema = new Schema({ name: Boolean });

      const value = false;

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('Date', () => {
    it('should return false when it is not a Date', async () => {
      const schema = new Schema({ name: Date });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a Date', async () => {
      const schema = new Schema({ name: Date });

      const value = new Date();

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });

    it('should return false when it is not a Date String', async () => {
      const schema = new Schema({ name: Date });

      const value = '2023-11--23T07:58:30.996+0100';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a Date String', async () => {
      const schema = new Schema({ name: Date });

      const value = '2023-11-23T07:58:30.996+0100';

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('Buffer', () => {
    it('should return false when it is not a Buffer', async () => {
      const schema = new Schema({ name: Buffer });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a Buffer', async () => {
      const schema = new Schema({ name: Buffer });

      const value = Buffer.from('khbdf', 'utf-8');

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('ObjectId', () => {
    it('should return false when it is not a ObjectId', async () => {
      const schema = new Schema({ name: mongoose.Types.ObjectId });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a ObjectId', async () => {
      const schema = new Schema({ name: mongoose.Types.ObjectId });

      const value = new mongoose.Types.ObjectId();

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });

    it('should return true when it is a ObjectId HexString', async () => {
      const schema = new Schema({ name: mongoose.Types.ObjectId });

      const value = new mongoose.Types.ObjectId().toHexString();

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });

  describe('Map', () => {
    it('should return false when it is not a Map', async () => {
      const schema = new Schema({ name: Map });

      const value = 'a';

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a Map', async () => {
      const schema = new Schema({
        name: {
          type: Map,
          of: Number,
        },
      });

      const value = { string: 56789 };

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });

    it('should return false when it is a Map.Number', async () => {
      const schema = new Schema({
        name: {
          type: Map,
          of: Number,
        },
      });

      const value = { string: '56789' };

      const result = validatePathType('name', value, schema);

      expect(result).toBeFalsy();
    });

    it('should return true when it is a Map.SubSchema', async () => {
      const subSchema = new Schema({
        foo: String,
        bar: Number,
      });
      const schema = new Schema({
        name: {
          type: Map,
          of: subSchema,
        },
      });

      const value = {
        name: {
          foo: 'mkqds',
          bar: 456,
        },
      };

      const result = validatePathType('name', value, schema);

      expect(result).toBeTruthy();
    });
  });
});

describe('validateObjectAgainstSchemap', () => {
  const subSchema = new Schema({
    foo: String,
    bar: Number,
  });
  const schema = new Schema({
    required: {
      type: String,
      isRequired: true,
    },
    string: String,
    uuid: mongoose.Schema.Types.UUID,
    number: Number,
    bigInt: BigInt,
    decimal128: mongoose.Schema.Types.Decimal128,
    boolean: Boolean,
    date: Date,
    buffer: Buffer,
    objectId: mongoose.Schema.Types.ObjectId,
    map: {
      type: Map,
      of: Number,
    },
    subSchema,
    mixed: mongoose.Schema.Types.Mixed,
    array: [String],
    documentArray: subSchema,
  });

  it("should return true when object's corresponding to Schema", async () => {
    let value = {
      required: faker.string.sample(),
      string: faker.string.sample(),
      uuid: uuid.v5('www.cursopag.net', uuid.v5.URL),
      number: 56,
      bigInt: 42n,
      decimal128: new mongoose.Types.Decimal128('56.98'),
      boolean: true,
      date: new Date(),
      buffer: Buffer.from('cursopag'),
      objectId: new mongoose.Types.ObjectId(),
      map: {
        number: faker.number.int(),
      },
      subSchema: {
        foo: faker.string.sample(),
        bar: faker.number.float(),
      },
    };

    const result = validateObjectAgainstSchema(value, schema);

    expect(result).toBeTruthy();
  });

  it('should return false when a key is not in the schema', async () => {
    const value = {
      bigInt: 42n,
      required: undefined,
    };

    const result = validateObjectAgainstSchema(value, schema);

    expect(result).toBeFalsy();
  });
});
