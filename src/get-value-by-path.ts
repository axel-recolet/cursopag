export function getValueByPath(
  obj: Record<string, unknown>,
  path: string,
): { exists: boolean; value: unknown } {
  try {
    const keys = path.split('.');
    let currentObj: unknown = obj;
    for (const key of keys) {
      if (currentObj && typeof currentObj === 'object' && key in currentObj) {
        currentObj = (currentObj as Record<string, unknown>)[key];
      } else {
        return { value: undefined, exists: false };
      }
    }
    return { value: currentObj, exists: true };
  } catch (error) {
    throw error;
  }
}
