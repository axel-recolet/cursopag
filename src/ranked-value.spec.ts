import { Binary, Decimal128 } from 'bson';
import { RankedValue, compare } from './ranked-value';
import { Types } from 'mongoose';

describe('RankedValue class', () => {
  describe('setProperties method', () => {
    describe('[] value', () => {
      const value: unknown[] = [];
      it('should set properties for [] value (Ascending)', () => {
        const rankedValue = new RankedValue(value, 1);
        expect(rankedValue.rank).toBe(-1);
        expect(rankedValue.value).toEqual(value);
      });

      it('should set properties for [] value (Descending)', () => {
        const rankedValue = new RankedValue(value, -1);
        expect(rankedValue.rank).toBe(-1);
        expect(rankedValue.value).toEqual(value);
      });
    });

    describe('undefined value', () => {
      const value = undefined;
      it('should set properties for undefined value (Ascending)', () => {
        const rankedValue = new RankedValue(value, 1);
        expect(rankedValue.rank).toBe(1);
        expect(rankedValue.value).toEqual(value);
      });

      it('should set properties for undefined value (Descending)', () => {
        const rankedValue = new RankedValue(value, -1);
        expect(rankedValue.rank).toBe(0);
        expect(rankedValue.value).toEqual(value);
      });
    });

    describe('null value', () => {
      const value = null;
      it('should set properties for null value (Ascending)', () => {
        const rankedValue = new RankedValue(value, 1);
        expect(rankedValue.rank).toBe(0);
        expect(rankedValue.value).toEqual(value);
      });

      it('should set properties for null value (Descending)', () => {
        const rankedValue = new RankedValue(value, -1);
        expect(rankedValue.rank).toBe(1);
        expect(rankedValue.value).toEqual(value);
      });
    });

    describe('Numbers (numbers, bigInts, decimal128s)', () => {
      describe.each([
        { value: -1, direction: 1, rank: 2 },
        { value: -1, direction: -1, rank: 2 },
        { value: 0, direction: 1, rank: 2 },
        { value: 0, direction: -1, rank: 2 },
        { value: 1, direction: 1, rank: 2 },
        { value: 1, direction: -1, rank: 2 },
      ])('ints', ({ value, direction, rank }) => {
        describe(`${value}`, () => {
          it(`should set properties for ${value} value ${
            direction === 1 ? '(Ascending)' : '(Descending)'
          }`, () => {
            const rankedValue = new RankedValue(value, direction as 1 | -1);
            expect(rankedValue.rank).toBe(rank);
            expect(rankedValue.value).toEqual(value);
          });
        });
      });

      describe.each([
        { value: -1n, direction: 1, rank: 2 },
        { value: -1n, direction: -1, rank: 2 },
        { value: 0n, direction: 1, rank: 2 },
        { value: 0n, direction: -1, rank: 2 },
        { value: 1n, direction: 1, rank: 2 },
        { value: 1n, direction: -1, rank: 2 },
      ])('bigInts', ({ value, direction, rank }) => {
        describe(`${value}n`, () => {
          it(`should set properties for ${value}n value ${
            direction === 1 ? '(Ascending)' : '(Descending)'
          }`, () => {
            const rankedValue = new RankedValue(value, direction as 1 | -1);
            expect(rankedValue.rank).toBe(rank);
            expect(rankedValue.value).toEqual(value);
          });
        });
      });

      describe.each([
        { value: new Decimal128('-1.8'), direction: 1, rank: 2 },
        { value: new Decimal128('-1.8'), direction: -1, rank: 2 },
        { value: new Decimal128('0'), direction: 1, rank: 2 },
        { value: new Decimal128('0'), direction: -1, rank: 2 },
        { value: new Decimal128('1.8'), direction: 1, rank: 2 },
        { value: new Decimal128('1.8'), direction: -1, rank: 2 },
      ])('Decimals128', ({ value, direction, rank }) => {
        describe(`${value}`, () => {
          it(`should set properties for ${value}n value ${
            direction === 1 ? '(Ascending)' : '(Descending)'
          }`, () => {
            const rankedValue = new RankedValue(value, direction as 1 | -1);
            expect(rankedValue.rank).toBe(rank);
            expect(rankedValue.value).toEqual(value);
          });
        });
      });
    });

    describe.each([
      { value: '', direction: 1, rank: 3 },
      { value: '', direction: -1, rank: 3 },
      { value: 'string', direction: 1, rank: 3 },
      { value: 'string', direction: -1, rank: 3 },
    ])('String', ({ value, direction, rank }) => {
      it(`should set properties for '${value}' value ${
        direction === 1 ? '(Ascending)' : '(Descending)'
      }`, () => {
        const rankedValue = new RankedValue(value, direction as 1 | -1);
        expect(rankedValue.rank).toBe(rank);
        expect(rankedValue.value).toEqual(value);
      });
    });
  });

  describe('compare method', () => {
    describe.each([
      {
        a: [],
        aDesc: '[]',
        b: null,
        direction: 1,
        expected: -1,
      },
      {
        a: null,
        b: undefined,
        direction: 1,
        expected: -1,
      },
      {
        a: undefined,
        b: 0,
        direction: 1,
        expected: -1,
      },
      {
        a: undefined,
        b: -1,
        direction: 1,
        expected: -1,
      },
      {
        a: -1,
        b: 0,
        direction: 1,
        expected: -1,
      },
      {
        a: 0,
        b: 1,
        direction: 1,
        expected: -1,
      },
      {
        a: 1,
        b: new Decimal128('1.5'),
        direction: 1,
        expected: -1,
      },
      {
        a: new Decimal128('1.5'),
        b: '',
        bDesc: "''",
        direction: 1,
        expected: -1,
      },
      {
        a: '',
        aDesc: "''",
        b: 'a',
        direction: 1,
        expected: -1,
      },
      {
        a: 'a',
        b: 'A',
        direction: 1,
        expected: -1,
      },
      {
        a: 'A',
        b: 'aa',
        direction: 1,
        expected: -1,
      },
      {
        a: 'aa',
        b: { key: 1 },
        bDesc: '{ key: 1 }',
        direction: 1,
        expected: -1,
      },
      {
        a: { key: 1 },
        aDesc: '{ key: 1 }',
        b: { key: 'a' },
        bDesc: "{ key: 'a' }",
        direction: 1,
        expected: -1,
      },
      {
        a: { key: 'a' },
        aDesc: "{ key: 'a' }",
        b: [new Types.ObjectId(), true],
        bDesc: '[ObjectId, true]',
        direction: 1,
        expected: -1,
      },
      {
        a: { key: 'a' },
        aDesc: "{ key: 'a' }",
        b: { moo: 'a' },
        bDesc: "{ moo: 'a' }",
        direction: 1,
        expected: -1,
      },
      {
        a: { moo: 'a' },
        aDesc: "{ moo: 'a' }",
        b: { moo: 'a', key: 1 },
        bDesc: "{ moo: 'a', key: 1 }",
        direction: 1,
        expected: -1,
      },
      {
        a: { moo: 'a', key: 1 },
        aDesc: "{ moo: 'a', key: 1 }",
        b: new Binary(Buffer.from('a'), Binary.SUBTYPE_BYTE_ARRAY),
        bDesc: "Binary('a')",
        direction: 1,
        expected: -1,
      },
      {
        a: new Binary(Buffer.from('a'), Binary.SUBTYPE_BYTE_ARRAY),
        aDesc: "Binary('a')",
        b: new Types.ObjectId('657a13ff46f68004fe886ea6'),
        bDesc: "ObjectId('657a13ff46f68004fe886ea6')",
        direction: 1,
        expected: -1,
      },
      {
        a: new Types.ObjectId('657a13ff46f68004fe886ea6'),
        aDesc: "ObjectId('657a13ff46f68004fe886ea6')",
        b: new Types.ObjectId('657a13ff46f68004fe886ea7'),
        bDesc: "ObjectId('657a13ff46f68004fe886ea7')",
        direction: 1,
        expected: -1,
      },
      {
        a: new Types.ObjectId('657a13ff46f68004fe886ea7'),
        aDesc: 'ObjectId',
        b: false,
        bDesc: 'false',
        direction: 1,
        expected: -1,
      },
      {
        a: false,
        aDesc: 'false',
        b: true,
        bDesc: 'true',
        direction: 1,
        expected: -1,
      },
      {
        a: true,
        aDesc: 'true',
        b: new Date('2023-12-13T21:25+01:00'),
        bDesc: "Date('2023-12-13T21:25+01:00')",
        direction: 1,
        expected: -1,
      },
      {
        a: [],
        b: new Binary(Buffer.from('a'), Binary.SUBTYPE_BYTE_ARRAY),
        direction: 1,
        expected: -1,
      },
      {
        a: [],
        b: new Types.ObjectId(),
        direction: 1,
        expected: -1,
      },
      {
        a: [],
        b: false,
        direction: 1,
        expected: -1,
      },
    ])('ascending', ({ a, aDesc, b, bDesc, direction, expected }) => {
      it(`${aDesc ?? a} ${
        expected === 1 ? '>' : expected === 0 ? '===' : '<'
      } ${bDesc ?? b}`, () => {
        const result = compare(a, b, direction as 1 | -1);
        expect(result).toEqual(expected);
      });
    });

    // Add more tests for comparing various data types and scenarios...
  });

  // Add more test suites for different methods and scenarios within the RankedValue class...
});
