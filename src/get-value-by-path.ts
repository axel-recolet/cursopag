export function getValueByPath(
  cursor: Record<string, unknown>,
  path: string,
): unknown {
  try {
    const keys = path.split('.');
    let currentObj: unknown = cursor;
    for (const key of keys) {
      if (currentObj && typeof currentObj === 'object' && key in currentObj) {
        currentObj = (currentObj as Record<string, unknown>)[key];
      } else {
        throw new Error(`${key} is not a key of cursor.`);
      }
    }
    return currentObj;
  } catch (error) {
    throw error;
  }
}
