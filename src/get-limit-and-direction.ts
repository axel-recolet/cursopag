/**
 * Determines the direction (ascending or descending) and limit based on the provided parameters.
 * @param {Object} params An object containing 'first' or 'last' properties representing the limit.
 * @param {number} [params.first] The limit for the first items.
 * @param {number} [params.last] The limit for the last items.
 * @returns {{ direction: 1 | -1, limit: number }} An object containing direction (1 or -1) and the limit.
 * @throws {Error} Throws an error if unable to determine direction based on provided parameters.
 */
export function getLimitAndDirection({
  first,
  last,
}: {
  first?: number;
  last?: number;
}): {
  direction: 1 | -1;
  limit: number;
} {
  try {
    if (!first && !last)
      throw Error('Neither first nor last is set. Unable to find direction.');
    else if (first && last)
      throw Error('Both first and last are set. Unable to find direction.');

    if (first) {
      // If 'first' is provided, set direction as ascending (1)
      return { direction: 1, limit: first };
    } else if (last) {
      // If 'last' is provided, set direction as descending (-1)
      return { direction: -1, limit: last };
    }

    // Throw an error for unexpected scenarios
    throw new Error('An unexpected error occurred.');
  } catch (error) {
    // Propagate the error up if caught
    throw error;
  }
}
