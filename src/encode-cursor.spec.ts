import { EJSON } from 'bson';
import {
  cursorPreDecoder,
  cursorDecoder,
  cursorEncoder,
} from './encode-cursor';
import { Types } from 'mongoose';

describe('cursorEncoder and cursorDecoder', () => {
  describe('cursor object is empty', () => {
    const decodedCursor = {};
    const encodedCursor = 'e30=';

    it('should return an string if the input cursor object is empty', () => {
      const ejson = EJSON.stringify(decodedCursor, { relaxed: false });
      const result = cursorEncoder(ejson);
      expect(result).toEqual(encodedCursor);
    });

    it('should return an empty object if the encoded cursor is empty', () => {
      const result = EJSON.parse(cursorDecoder(encodedCursor));
      expect(result).toEqual(decodedCursor);
    });
  });

  describe('non-empty cursor object', () => {
    const decodedCursor = {
      key1: 'value1',
      key2: 123,
      key3: { nested: true },
      key4: new Types.ObjectId('656da2f8c675a76c669dfded'),
    };
    const encodedCursor =
      'eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6eyIkbnVtYmVySW50IjoiMTIzIn0sImtleTMiOnsibmVzdGVkIjp0cnVlfSwia2V5NCI6eyIkb2lkIjoiNjU2ZGEyZjhjNjc1YTc2YzY2OWRmZGVkIn19';

    it('should return a valid encoded string for a non-empty cursor object', () => {
      const ejson = EJSON.stringify(decodedCursor, { relaxed: false });
      const result = cursorEncoder(ejson);
      expect(result).toEqual(encodedCursor);
    });

    it('should return a non-empty cursor object for a valid encoded string ', () => {
      const result = EJSON.parse(cursorDecoder(encodedCursor));
      expect(result).toEqual(decodedCursor);
    });
  });

  describe('Special characters and edge case', () => {
    const decodedCursor = {
      specialKey: '@$%^&*()-_=+/.,<>?`~|}{[]',
      emptyArray: [],
      nullValue: null,
    };
    const encodedCursor =
      'eyJzcGVjaWFsS2V5IjoiQCQlXiYqKCktXz0rLy4sPD4/YH58fXtbXSIsImVtcHR5QXJyYXkiOltdLCJudWxsVmFsdWUiOm51bGx9';

    it('should handle special characters and edge cases properly', () => {
      const ejson = EJSON.stringify(decodedCursor, { relaxed: false });
      const result = cursorEncoder(ejson);
      expect(result).toEqual(encodedCursor);
    });

    it('should decode object with special characters and edge cases properly', () => {
      const result = EJSON.parse(cursorDecoder(encodedCursor));
      expect(result).toEqual(decodedCursor);
    });
  });
});

describe('cursorPreDecoder function', () => {
  it('should return undefined if both "after" and "before" are undefined', async () => {
    const result = await cursorPreDecoder();
    expect(result).toBeUndefined();
  });

  it('should throw an error if both "after" and "before" are defined', async () => {
    await expect(
      cursorPreDecoder({ after: 'someAfter', before: 'someBefore' }),
    ).rejects.toThrow('"after" and "before" are both defined.');
  });

  it('should correctly decode the "after" cursor string using the default decoder', async () => {
    const decodedCursor = {
      key1: 'value1',
      key2: 123,
      key3: { nested: true },
      key4: new Types.ObjectId('656da2f8c675a76c669dfded'),
    };

    const after =
      'eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6eyIkbnVtYmVySW50IjoiMTIzIn0sImtleTMiOnsibmVzdGVkIjp0cnVlfSwia2V5NCI6eyIkb2lkIjoiNjU2ZGEyZjhjNjc1YTc2YzY2OWRmZGVkIn19';
    const result = await cursorPreDecoder({ after });
    expect(result).toEqual(decodedCursor);
  });

  it('should return the provided "after" cursor object without decoding', async () => {
    const after = {
      key1: 'value1',
      key2: 123,
      key3: { nested: true },
    };
    const result = await cursorPreDecoder({ after });
    expect(result).toEqual(after);
  });

  it('should correctly decode the "before" cursor string using the default decoder', async () => {
    const decodedCursor = {
      key1: 'value1',
      key2: 123,
      key3: { nested: true },
      key4: new Types.ObjectId('656da2f8c675a76c669dfded'),
    };
    const before =
      'eyJrZXkxIjoidmFsdWUxIiwia2V5MiI6eyIkbnVtYmVySW50IjoiMTIzIn0sImtleTMiOnsibmVzdGVkIjp0cnVlfSwia2V5NCI6eyIkb2lkIjoiNjU2ZGEyZjhjNjc1YTc2YzY2OWRmZGVkIn19';

    const result = await cursorPreDecoder({ before });
    expect(result).toEqual(decodedCursor);
  });

  it('should return the provided "before" cursor object without decoding', async () => {
    const before = {
      key1: 'value1',
      key2: 123,
      key3: { nested: true },
      key4: new Types.ObjectId('656da2f8c675a76c669dfded'),
    };
    const result = await cursorPreDecoder({ before });
    expect(result).toEqual(before);
  });
});
