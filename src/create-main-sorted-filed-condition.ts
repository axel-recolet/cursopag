import { Condition, Schema } from 'mongoose';

/**
 * Creates a condition for sorting based on a specified field, direction, and value.
 * @param {[string, 1 | -1]} mainSort Array containing the field name and sorting direction (1 for ascending, -1 for descending).
 * @param {unknown} value The value used for comparison in the sorting condition.
 * @param {Schema} schema The Mongoose schema to retrieve field information.
 * @param {boolean} skip Indicates whether to skip certain conditions.
 * @returns {Condition<T>} The generated condition for sorting.
 * @throws {Error} Throws an error if there's an issue with schema retrieval.
 */
export function createMainSortedFiledCondition<T = unknown>(
  [field, sortDir]: [string, 1 | -1],
  value: unknown,
  schema: Schema,
  skipEqual: boolean,
  direction: 1 | -1,
): Condition<T> {
  try {
    // Retrieve the type of the field from the schema
    const schemaType = schema.path(field);

    if (!schemaType) {
      throw new Error(`${field} doesn't exist in the schema.`);
    }

    if (schemaType instanceof Schema.Types.Boolean) {
      if (direction === 1) {
        if (sortDir === 1) {
          if (value === false) {
            return;
          } else {
            return { [field]: value };
          }
        } else {
          if (value === true) {
            return;
          } else {
            return { [field]: value };
          }
        }
      } else {
        if (sortDir === 1) {
          if (value === true) {
            return;
          } else {
            return { [field]: value };
          }
        } else {
          if (value === false) {
            return;
          } else {
            return { [field]: value };
          }
        }
      }
    }

    // Retrieve if the field is marked as unique in the schema
    const isUnique = field === '_id' ? true : schemaType.options.unique;

    let op = direction === sortDir ? '$gt' : '$lt'; // Define the comparison operator

    if (!isUnique || !skipEqual) {
      op += 'e'; // Modify the operator if not unique and not skipping
    }
    return {
      [field]: { [op]: value }, // Construct the sorting condition
    };
  } catch (error) {
    // Throw any error encountered during schema retrieval
    throw error;
  }
}
