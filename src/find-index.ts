import { compare } from './ranked-value';

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
export function findIndex({
  direction,
  cursor,
  list,
  sort,
  skipCursor,
}: {
  direction: 1 | -1;
  cursor: Record<string, unknown>;
  list: Record<string, unknown>[];
  sort: [string, 1 | -1][];
  skipCursor: boolean;
}): number {
  let low = 0;
  let high = list.length - 1;
  let mid = 0;

  while (low <= high) {
    mid = Math.floor((low + high) / 2);

    // Compare the cursor object with the object at the middle index based on sort criteria.
    const comparison = sortObjectsByCriteria(cursor, list[mid], sort);

    if (comparison === 0) {
      // If cursor matches the middle object
      if (
        (skipCursor && direction === 1) ||
        (!skipCursor && direction === -1)
      ) {
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
