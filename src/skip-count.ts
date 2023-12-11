import { Condition, FilterQuery, Model } from 'mongoose';
import { getValueByPath } from './get-value-by-path';
import { compare } from './compare-value';

/**
 * Sorts two objects based on specified sorting criteria.
 * @param {Object.<string, any>} objA The first object to compare.
 * @param {Object.<string, any>} objB The second object to compare.
 * @param {Array<[string, 1 | -1]>} sortCriteria The criteria for sorting the objects.
 * @returns {-1 | 0 | 1} Returns -1 if objA should come before objB, 1 if objA should come after objB, or 0 if they are equal.
 */
export function sortObjectsByCriteria(
  objA: Record<string, unknown>,
  objB: Record<string, unknown>,
  sortCriteria: [string, 1 | -1][],
): -1 | 0 | 1 {
  for (const [key, sortOrder] of sortCriteria) {
    const result = compare(objA[key], objB[key], sortOrder);

    if (result === 0) continue;
    else if (result === -1) return sortOrder;
    else return -sortOrder as 1 | -1;
  }
  // Return 0 if objects are equal based on all sorting criteria
  return 0;
}

/**
 * Finds the index where a given cursor should be inserted into a sorted list.
 * @param {Record<string, unknown>} cursor - The object to be inserted.
 * @param {Record<string, unknown>[]} list - The sorted list of objects.
 * @param {[string, 1 | -1][]} sortCriteria - The criteria used for sorting the list.
 * @param {1 | -1} direction - The direction of sorting (1 for ascending, -1 for descending). Defaults to 1.
 * @returns {number} - Returns the index where the object should be inserted.
 */
export function findIndex(
  direction: 1 | -1,
  cursor: Record<string, unknown>,
  list: Record<string, unknown>[],
  sortCriteria: [string, 1 | -1][],
  skipEqual: boolean,
): number {
  let low = 0;
  let high = list.length - 1;
  let mid = 0;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);

    // Compare the cursor object with the object at the middle index based on sort criteria.
    const comparison = sortObjectsByCriteria(cursor, list[mid], sortCriteria);

    if (comparison === 0) {
      // If cursor matches the middle object
      if ((skipEqual && direction === 1) || (!skipEqual && direction === -1)) {
        return mid + 1;
      } else {
        return mid;
      }
    } else if (comparison > 0) {
      // Adjust high index for cursor being in the left side.
      high = mid - 1;
    } else {
      // Adjust low index for cursor being in the right side.
      low = mid + 1;
    }
  }

  return low; // Return the index where the object should be inserted
}

/**
 * Retrieves the count to skip based on a given cursor in a sorted collection.
 * @param {Object} options - The options object.
 * @param {Model<T>} options.model - The Mongoose model representing the collection.
 * @param {Record<string, unknown>} options.cursor - The cursor object used for comparison.
 * @param {[string, 1 | -1][]} options.sort - The sorting criteria.
 * @param {FilterQuery<T>} options.filter - The filter query for database lookup.
 * @returns {Promise<number>} - Returns the count to skip.
 */
export async function skipCount<T = unknown>({
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
  fullCheck: boolean;
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
    return findIndex(1, cursor, equalDocs, sort, skipEqual);
  } catch (error) {
    throw error;
  }
}
