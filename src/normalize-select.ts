/**
 * Normalizes a string representing select fields into an array of tuples.
 * @param {string} select - The string containing select fields.
 * @returns {[string, 0 | 1][]} An array of tuples representing normalized select fields.
 */
export function normalizeStringSelect(select: string): [string, 0 | 1][] {
  try {
    const result: [string, 0 | 1][] = [];

    // Split the input 'select' string by whitespace and process each select field
    for (const sortField of select.split(/\s+/)) {
      // Use regex to extract field name and unselect indicator from the sortField
      const { unselect, field }: { unselect?: '-'; field?: string } =
        /^(?<unselect>-*)?(?<field>.+)?/s.exec(sortField)?.groups ?? {};

      // If field name doesn't exist, skip to the next iteration
      if (!field) continue;

      // Determine the selection indicator based on the presence
      // of unselect (-) and push to 'result'
      result.push([field, unselect ? 0 : 1]);
    }

    // Return the array containing normalized select fields
    return result;
  } catch (error) {
    // If any error occurs during the process, throw the error
    throw error;
  }
}

// export function normalizeSelect(
//   select: string | Record<string, unknown> | string[],
// ): [string, 0 | 1][] {
//   try {
//     if (typeof select === 'string') {
//     }
//   } catch (error) {
//     throw error;
//   }
// }
