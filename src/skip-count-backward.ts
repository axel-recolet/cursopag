import { Condition, FilterQuery, Model, Schema } from 'mongoose';
import { getValueByPath } from './get-value-by-path';
import { findIndex } from './find-index';

export function booleanBeforeConditionBackward<T>(
  [field, sortDir]: [string, 1 | -1],
  value: unknown,
  schema: Schema,
): Condition<T> | undefined {
  try {
    // Retrieve the type of the field from the schema
    const schemaType = schema.path(field);

    if (!schemaType) {
      throw new Error(`${field} doesn't exist in the schema.`);
    }

    if (schemaType instanceof Schema.Types.Boolean) {
      if (sortDir === 1) {
        if (value === true) {
          return { [field]: false };
        } else {
          return;
        }
      } else {
        if (value === false) {
          return { [field]: true };
        } else {
          return;
        }
      }
    }

    return { [field]: { [sortDir === 1 ? '$lt' : '$gt']: value } };
  } catch (error) {
    throw error;
  }
}

export async function skipCountBackward<T = unknown>({
  model,
  cursor,
  sort,
  filter,
  skipCursor,
}: {
  model: Model<T>;
  cursor: Record<string, unknown>;
  sort: [string, 1 | -1][];
  filter: FilterQuery<T>;
  skipCursor: boolean;
}): Promise<number> {
  try {
    // Get the first field from the sorting criteria.
    const field = sort[0][0];
    // Retrieve the value of the field from the cursor.
    const { value, exists } = getValueByPath(cursor, field);

    // Throw an error if the field doesn't exist in the cursor.
    if (!exists) throw new Error(`${field} is not a key of cursor.`);

    const beforeCondition = booleanBeforeConditionBackward(
      sort[0],
      value,
      model.schema,
    );

    const beforeQuery = !beforeCondition
      ? undefined
      : ({
          $and: [filter, beforeCondition],
        } as any);

    const beforeCount = !beforeQuery
      ? 0
      : await model.find(beforeQuery).sort(sort).countDocuments();

    // Create a query to find documents with the same value as the cursor's field.
    const equalQuery: Condition<T> = {
      $and: [filter, { [field]: value }],
    };

    // Retrieve documents matching the equal query,
    // select fields for sorting, sort the documents, and make them lean.
    const equalDocs = await model
      .find(equalQuery)
      .select(sort.map((value) => value[0]))
      .sort(sort)
      .lean();

    // Find the index where the cursor object should be inserted in the sorted documents.
    return (
      beforeCount +
      findIndex({ direction: -1, cursor, list: equalDocs, sort, skipCursor })
    );
  } catch (error) {
    throw error;
  }
}
