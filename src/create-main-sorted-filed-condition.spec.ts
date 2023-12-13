import { Schema } from 'mongoose';
import { createMainSortedFiledCondition } from './create-main-sorted-filed-condition';

describe('createMainSortedFiledCondition function', () => {
  // Mocking a basic schema for testing purposes
  const schema = new Schema({
    name: { type: String },
    age: { type: Number },
    isActive: { type: Boolean },
    friends: { type: [String] },
  });

  describe('Field is a boolean type', () => {
    const field = 'isActive';
    const schema = new Schema({
      [field]: { type: Boolean },
    });

    describe('Ascending direction', () => {
      const direction = 1;

      describe('Ascending Sort Order', () => {
        const sortOrder = 1;

        describe('SkipCursor true', () => {
          const skipCursor = true;

          it('Value true, direction = 1, sortOrder = 1, skip = true', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({ [field]: true });
          });

          it('Value false, direction = 1, sortOrder = 1, skip = true', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });
        });

        describe('SkipCursor false', () => {
          const skipCursor = false;

          it('Value true, direction = 1, sortOrder = 1, skip = false', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: true,
            });
          });

          it('Value false, direction = 1, sortOrder = 1, skip = false', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });
        });
      });

      describe('Descending Sort Order', () => {
        const sortOrder = -1;

        describe('SkipCursor true', () => {
          const skipCursor = true;

          it('Value true, direction = 1, sortOrder = -1, skip = true', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });

          it('Value false, direction = 1, sortOrder = -1, skip = true', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: false,
            });
          });
        });

        describe('SkipCursor false', () => {
          const skipCursor = false;

          it('Value true, direction = 1, sortOrder = -1, skip = false', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });

          it('Value false', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: false,
            });
          });
        });
      });
    });

    describe('Descending direction', () => {
      const direction = -1;

      describe('Ascending Sort Order', () => {
        const sortOrder = 1;

        describe('SkipCursor true', () => {
          const skipCursor = true;

          it('Value true, direction = -1, sortOrder = 1, skip = true', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });

          it('Value false, direction = -1, sortOrder = 1, skip = true', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: false,
            });
          });
        });

        describe('SkipCursor false', () => {
          const skipCursor = false;

          it('Value true, direction = 1, sortOrder = 1, skip = false', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });

          it('Value false, direction = 1, sortOrder = 1, skip = false', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: false,
            });
          });
        });
      });

      describe('Descending Sort Order', () => {
        const sortOrder = -1;

        describe('SkipCursor true', () => {
          const skipCursor = true;

          it('Value true, direction = -1, sortOrder = -1, skip = true', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: true,
            });
          });

          it('Value false, direction = -1, sortOrder = -1, skip = true', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });
        });

        describe('SkipCursor false', () => {
          const skipCursor = false;

          it('Value true, direction = -1, sortOrder = -1, skip = false', () => {
            const cursor = { [field]: true };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toEqual({
              [field]: true,
            });
          });

          it('Value false, direction = -1, sortOrder = -1, skip = false', () => {
            const cursor = { [field]: false };

            const condition = createMainSortedFiledCondition({
              mainSort: [field, sortOrder],
              cursor,
              schema,
              skipCursor,
              direction,
            });

            expect(condition).toBeUndefined();
          });
        });
      });
    });
  });

  it('should create a condition for sorting when the field is not a boolean type and skip is false', () => {
    const field = 'age';
    const value = 30;

    const condition = createMainSortedFiledCondition({
      mainSort: [field, -1],
      cursor: { [field]: value },
      schema,
      skipCursor: false,
      direction: 1,
    });

    expect(condition).toEqual({
      [field]: { $lte: value }, // Expects the condition for non-boolean type with skip as false and direction -1
    });
  });

  it('should create a condition for sorting when the field is array of string type and skip is false', () => {
    const field = 'age';
    const value = 30;

    const condition = createMainSortedFiledCondition({
      mainSort: [field, -1],
      cursor: { [field]: value },
      schema,
      skipCursor: false,
      direction: 1,
    });

    expect(condition).toEqual({
      [field]: { $lte: value }, // Expects the condition for non-boolean type with skip as false and direction -1
    });
  });

  it('should create a condition for Buffer schemaType', () => {
    const schema = new Schema({
      field: Buffer,
    });

    const field = 'field';
    const value = Buffer.from('example');

    const condition = createMainSortedFiledCondition({
      mainSort: [field, 1],
      cursor: { [field]: value },
      schema,
      skipCursor: false,
      direction: 1,
    });

    // Buffer type should construct a condition with $gte operator
    expect(condition).toEqual({ field: { $gte: value } });
  });

  it('should handle errors when schema retrieval fails', () => {
    const field = 'nonExistentField';
    const value = 'test';

    // Expecting an error to be thrown when the field does not exist in the schema
    expect(() =>
      createMainSortedFiledCondition({
        mainSort: [field, 1],
        cursor: { [field]: value },
        schema,
        skipCursor: false,
        direction: 1,
      }),
    ).toThrow();
  });
});
