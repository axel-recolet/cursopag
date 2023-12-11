import { EJSON } from 'bson';

/**
 * Decodes an encoded cursor string into a Record<string, unknown> object.
 * @param {string} encodedCursor - The encoded cursor string to decode.
 * @returns {Record<string, unknown>} The decoded cursor object.
 * @throws {Error} Throws an error if unable to decode the cursor.
 */
export function cursorDecoder(encodedCursor: string): string {
  try {
    // Attempt to decode the base64-encoded cursor string
    const decodedCursor = atob(encodedCursor);

    // Parse the decoded cursor string as JSON to obtain the cursor object
    return decodedCursor;
  } catch (error) {
    // If an error occurs during decoding or parsing, throw an error
    throw new Error('Unable to decode cursor.');
  }
}

const defaultCursorDecoder = cursorDecoder;

/**
 * Encodes a cursor object into a base64-encoded string.
 * @param {object} cursor - The cursor object to encode.
 * @returns {string} The base64-encoded cursor string.
 * @throws {Error} Throws an error if unable to encode the cursor.
 */
export function cursorEncoder(ejson: string): string {
  try {
    // Convert the cursor object to a JSON string and encode it using base64
    return btoa(ejson);
  } catch (error) {
    // If an error occurs during encoding, throw the error
    throw error;
  }
}

/**
 * Decodes cursors for pagination.
 * @param {object} params - Params for decoding cursors.
 * @param {string | Record<string, unknown>} [params.after] - The 'after' cursor to decode.
 * @param {string | Record<string, unknown>} [params.before] - The 'before' cursor to decode.
 * @param {(encodedCursor: string) => Promise<string> | string} [params.externalCursorDecoder] - External cursor decoding function.
 * @returns {Promise<Record<string, unknown> | undefined>} The decoded cursor object or undefined if not provided.
 */
export async function cursorPreDecoder(params?: {
  after?: string | Record<string, unknown>;
  before?: string | Record<string, unknown>;
  cursorDecoder?: (encodedCursor: string) => Promise<string> | string;
}): Promise<Record<string, unknown> | undefined> {
  try {
    const {
      after,
      before,
      cursorDecoder = defaultCursorDecoder,
    } = params ?? {};

    if (after && before) {
      // Check if both 'after' and 'before' are defined
      throw new Error('"after" and "before" are both defined.');
    } else if (!after && !before) {
      // Return undefined if neither 'after' nor 'before' are provided
      return undefined;
    }

    // Determine the cursor to decode based on the provided 'after' or 'before'
    const cursor = (after ?? before) as string | Record<string, unknown>;

    // Check if the cursor is a string for decoding, otherwise return as is
    if (typeof cursor === 'string') {
      // Decode the cursor using the provided or default decoder function
      return EJSON.parse(await cursorDecoder(cursor), { relaxed: true });
    } else {
      // Cursor is already decoded, return as is
      return cursor;
    }
  } catch (error) {
    // If any error occurs during the decoding process, throw the error
    throw error;
  }
}
