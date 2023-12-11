import { Condition, FilterQuery, Model } from 'mongoose';
import { getValueByPath } from './get-value-by-path';
import { findIndex, sortObjectsByCriteria } from './skip-count';

export async function skipBackward<T = unknown>({
  model,
  cursor,
  sort,
  filter,
  skipEqual,
}: {
  model: Model<T>;
  cursor: Record<string, unknown>;
  sort: [string, 1 | -1][];
  filter: FilterQuery<T>;
  skipEqual: boolean;
}): Promise<number> {
  try {
    // Get the first field from the sorting criteria.
    const field = sort[0][0];
    // Retrieve the value of the field from the cursor.
    const { value, exists } = getValueByPath(cursor, field);

    // Throw an error if the field doesn't exist in the cursor.
    if (!exists) throw new Error(`${field} is not a key of cursor.`);

    const beforeQuery = {
      $and: [
        filter,
        {
          [field]: {
            [typeof value === 'boolean'
              ? '$ne'
              : sort[0][1] === 1
                ? '$lt'
                : '$gt']: value,
          },
        },
      ],
    } as any;

    const beforeCount = await model
      .find(beforeQuery)
      .sort(sort)
      .countDocuments();

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
    return beforeCount + findIndex(-1, cursor, equalDocs, sort, skipEqual);
  } catch (error) {
    throw error;
  }
}
