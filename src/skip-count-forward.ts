import { Condition, FilterQuery, Model } from 'mongoose';
import { getValueByPath } from './get-value-by-path';
import { findIndex } from './find-index';

/**
 * Retrieves the number (of documents with the same value in the first sorted field
 * as the cursor) to ignore based on a given cursor in a sorted collection.
 * @param {Object} options - The options object.
 * @param {Model<T>} options.model - The Mongoose model representing the collection.
 * @param {Record<string, unknown>} options.cursor - The cursor object used for comparison.
 * @param {[string, 1 | -1][]} options.sort - The sorting criteria.
 * @param {FilterQuery<T>} options.filter - The filter query for database lookup.
 * @param {boolean} options.skipCursor - If the cursor is in the selection, +1
 * @returns {Promise<number>} - Returns the count to skip.
 */
export async function skipCountForward<T = unknown>({
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
    return findIndex({
      direction: 1,
      cursor,
      list: equalDocs,
      sort,
      skipCursor,
    });
  } catch (error) {
    throw error;
  }
}
