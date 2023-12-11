import { Schema, Types } from 'mongoose';
import { createMainSortedFiledCondition } from './create-main-sorted-filed-condition';
import { Binary, EJSON } from 'bson';

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

        describe('SkipEqual true', () => {
          const skip = true;

          it('Value true, direction = 1, sortOrder = 1, skip = true', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });

          it('Value false, direction = 1, sortOrder = 1, skip = true', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });
        });

        describe('SkipEqual false', () => {
          const skip = false;

          it('Value true, direction = 1, sortOrder = 1, skip = false', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });

          it('Value false, direction = 1, sortOrder = 1, skip = false', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });
        });
      });

      describe('Descending Sort Order', () => {
        const sortOrder = -1;

        describe('SkipEqual true', () => {
          const skip = true;

          it('Value true, direction = 1, sortOrder = -1, skip = true', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });

          it('Value false, direction = 1, sortOrder = -1, skip = true', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: false,
            });
          });
        });

        describe('SkipEqual false', () => {
          const skip = false;

          it('Value true, direction = 1, sortOrder = -1, skip = false', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });

          it('Value false', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });
        });
      });
    });

    describe('Ascending direction', () => {
      const direction = -1;

      describe('Ascending Sort Order', () => {
        const sortOrder = 1;

        describe('SkipEqual true', () => {
          const skip = true;

          it('Value true, direction = -1, sortOrder = 1, skip = true', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });

          it('Value false, direction = -1, sortOrder = 1, skip = true', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });
        });

        describe('SkipEqual false', () => {
          const skip = false;

          it('Value true, direction = 1, sortOrder = 1, skip = false', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });

          it('Value false, direction = 1, sortOrder = 1, skip = false', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });
        });
      });

      describe('Descending Sort Order', () => {
        const sortOrder = -1;

        describe('SkipEqual true', () => {
          const skip = true;

          it('Value true, direction = -1, sortOrder = -1, skip = true', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });

          it('Value false, direction = -1, sortOrder = -1, skip = true', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });
        });

        describe('SkipEqual false', () => {
          const skip = false;

          it('Value true, direction = -1, sortOrder = -1, skip = false', () => {
            const value = true;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toEqual({
              [field]: value,
            });
          });

          it('Value false, direction = -1, sortOrder = -1, skip = false', () => {
            const value = false;

            const condition = createMainSortedFiledCondition(
              [field, sortOrder],
              value,
              schema,
              skip,
              direction,
            );

            expect(condition).toBeUndefined();
          });
        });
      });
    });
  });

  it('should create a condition for sorting when the field is not a boolean type and skip is false', () => {
    const field = 'age';
    const direction = -1;
    const value = 30;
    const skip = false;

    const condition = createMainSortedFiledCondition(
      [field, direction],
      value,
      schema,
      skip,
      1,
    );

    expect(condition).toEqual({
      [field]: { $lte: value }, // Expects the condition for non-boolean type with skip as false and direction -1
    });
  });

  it('should create a condition for sorting when the field is array of string type and skip is false', () => {
    const field = 'age';
    const direction = -1;
    const value = 30;
    const skip = false;

    const condition = createMainSortedFiledCondition(
      [field, direction],
      value,
      schema,
      skip,
      1,
    );

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
    const direction: 1 | -1 = 1;
    const skip = false;

    const condition = createMainSortedFiledCondition(
      [field, direction],
      value,
      schema,
      skip,
      1,
    );

    // Buffer type should construct a condition with $gte operator
    expect(condition).toEqual({ field: { $gte: value } });
  });

  it('should handle errors when schema retrieval fails', () => {
    const field = 'nonExistentField';
    const direction = 1;
    const value = 'test';
    const skip = false;

    // Expecting an error to be thrown when the field does not exist in the schema
    expect(() => {
      createMainSortedFiledCondition(
        [field, direction],
        value,
        schema,
        skip,
        1,
      );
    }).toThrow();
  });
});
