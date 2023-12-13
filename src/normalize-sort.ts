import { SortOrder } from 'mongoose';

export type ASC = 'asc' | 'ascending' | 1;
export type DESC = 'desc' | 'descending' | -1;

/**
 * Checks if the provided direction represents an ascending order.
 * @param {string | number} direction - The direction to be checked.
 * @returns {direction is ASC} Indicates if the direction is ascending.
 */
export function isAscending(direction: string | number): direction is ASC {
  return ['asc', 'ascending', 1].includes(direction);
}

/**
 * Checks if the provided direction represents a descending order.
 * @param {string | number} direction - The direction to be checked.
 * @returns {direction is DESC} Indicates if the direction is descending.
 */
export function isDescending(direction: string | number): direction is DESC {
  return ['desc', 'descending', -1].includes(direction);
}

/**
 * Checks if the provided direction represents a valid sorting order (ascending or descending).
 * @param {string | number} direction - The direction to be checked, either a string or a number.
 * @returns {direction is SortOrder} Indicates if the direction is a valid sorting order.
 */
export function isSort(direction: string | number): direction is SortOrder {
  return isAscending(direction) || isDescending(direction);
}

/**
 * Parses a string representing sorting criteria into an array of tuples.
 * @param {string} sort - The string containing sorting criteria.
 * @returns {[string, 1 | -1][]} An array of tuples representing sorting criteria.
 */
export function normalizeStringSort(sort: string): [string, 1 | -1][] {
  try {
    // Initialize an empty array to store the sorting criteria
    const result: [string, 1 | -1][] = [];

    // Split the input 'sort' string by whitespace and process each sort field
    for (const sortField of sort.split(/\s+/)) {
      // Use regex to extract field name and sorting direction from the sortField
      const { DESC, field }: { DESC?: '-'; field?: string } =
        /^(?<DESC>-*)?(?<field>.+)?/s.exec(sortField)?.groups ?? {};

      // If field name doesn't exist, skip to the next iteration
      if (!field) continue;

      // Determine the sorting order based on the presence of DESC (-) and push to 'result'
      result.push([field, DESC ? -1 : 1]);
    }

    // Return the array containing sorting criteria for string fields
    return result;
  } catch (error) {
    // If any error occurs during the process, throw the error
    throw error;
  }
}

/**
 * Parses a record of sorting criteria into an array of tuples.
 * @param {Object.<string, SortOrder>} sort - The record containing sorting criteria.
 * @returns {[string, 1 | -1][]} An array of tuples representing sorting criteria.
 */
export function normalizeRecordSort(sort: {
  [key: string]: SortOrder;
}): [string, 1 | -1][] {
  try {
    // Convert the sort object into an array of key-value pairs
    const sortArray = Object.entries<SortOrder>(sort);

    // Initialize an empty array to store the sorting criteria
    const result: [string, 1 | -1][] = [];

    // Iterate through each key-value pair in the sortArray
    for (const [field, sens] of sortArray) {
      // Determine the sorting order based on the provided SortOrder and push to 'result'
      result.push([field, isDescending(sens) ? -1 : 1]);
    }

    // Return the array containing sorting criteria for record fields
    return result;
  } catch (error) {
    // If any error occurs during the process, throw the error
    throw error;
  }
}

/**
 * Parses an array of sorting criteria into an array of tuples.
 * @param {Array<[string, SortOrder]>} sort - The array containing sorting criteria tuples.
 * @returns {[string, 1 | -1][]} An array of tuples representing sorting criteria.
 */
export function normalizeArraySort(
  sort: [string, SortOrder][],
): [string, 1 | -1][] {
  try {
    // Initialize an empty array to store the sorting criteria
    const result: [string, 1 | -1][] = [];

    // Iterate through each tuple [field, dir] in the sort array
    for (const [field, dir] of sort) {
      // Determine the sorting order based on the provided SortOrder and push to 'result'
      result.push([field, isAscending(dir) ? 1 : -1]);
    }

    // Return the array containing sorting criteria for array fields
    return result;
  } catch (error) {
    // If any error occurs during the process, throw the error
    throw error;
  }
}

/**
 * Normalizes different representations of sorting criteria into an array of tuples.
 * @param {string | Object.<string, SortOrder> | Array<[string, SortOrder]>} sort - The sorting criteria.
 * @returns {[string, 1 | -1][]} An array of tuples representing normalized sorting criteria.
 */
export function normalizeSort(
  sort?: string | { [key: string]: SortOrder } | [string, SortOrder][],
): [string, 1 | -1][] {
  try {
    if (!sort) return [['_id', 1]];

    const result: [string, 1 | -1][] = [];

    if (typeof sort === 'string') {
      // If the input is a string, use normalizeStringSort function
      result.push(...normalizeStringSort(sort));
    } else if (Array.isArray(sort)) {
      // If the input is an array, use normalizeArraySort function
      result.push(...normalizeArraySort(sort));
    } else {
      // If the input is an object, use normalizeRecordSort function
      result.push(...normalizeRecordSort(sort));
    }

    if (!result.map((value) => value[0]).includes('_id')) {
      result.push(['_id', 1]);
    }

    return result;
  } catch (error) {
    // If any error occurs during the process, throw the error
    throw error;
  }
}

/**
 * Reverses the sort order (ascending to descending and vice versa) for an array of sort fields.
 * @param {Array<[string, 1 | -1]>} sort An array containing field names and their sorting directions.
 * @returns {Array<[string, 1 | -1]>} The reversed sort order array.
 * @throws {Error} Throws an error if an issue occurs during the sorting process.
 */
export function reverseSortOrder(sort: [string, 1 | -1][]): [string, 1 | -1][] {
  try {
    const result: [string, 1 | -1][] = [];
    for (const [field, direction] of sort) {
      // Reverse the direction of sorting for each field
      result.push([field, (direction * -1) as 1 | -1]);
    }
    return result;
  } catch (error) {
    throw error;
  }
}
