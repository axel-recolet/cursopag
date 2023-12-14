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
 * @param {boolean} options.skipCursor - The cursor is in the selection,
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
  cursor?: Record<string, unknown>;
  sort: [string, 1 | -1][];
  filter: FilterQuery<T>;
  skipCursor: boolean;
}): Promise<number> {
  try {
    if (!cursor) return 0;

    // Get the first field from the sorting criteria.
    const field = sort[0][0];
    // Retrieve the value of the field from the cursor.
    const value = getValueByPath(cursor, field);

    // Check if the main sorted field is unique
    const mainSortedFieldIsUnique: boolean =
      field === '_id' ? true : model.schema.path(field).options.unique;

    if (mainSortedFieldIsUnique) return 0;

    // Create a query to find documents with the same value as the cursor's field.
    const equalQuery: Condition<T> = {
      $and: [filter, { [field]: value }],
    };

    // Retrieve documents matching the equal query,
    // select fields for sorting, sort the documents, and make them lean.
    const equalDocs = await model
      .find(equalQuery)
      .select(sort.map(([sortedField]) => sortedField))
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
