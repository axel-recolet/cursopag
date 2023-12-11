import { getValueByPath } from './get-value-by-path';

describe('getValueByPath function', () => {
  const obj = {
    name: 'name',
    subDoc: {
      bar: {
        foo: 42,
      },
    },
  };

  it('should get value by valid path', () => {
    const result = getValueByPath(obj, 'subDoc.bar.foo');
    expect(result.exists).toBe(true);
    expect(result.value).toBe(42);
  });

  it('should indicate path does not exist', () => {
    const result = getValueByPath(obj, 'subDoc.bar.xyz');
    expect(result.exists).toBe(false);
    expect(result.value).toBe(undefined);
  });

  it('should handle incomplete paths', () => {
    const result = getValueByPath(obj, 'subDoc.bar');
    expect(result.exists).toBe(true);
    expect(result.value).toEqual({ foo: 42 });
  });

  it('should handle empty path', () => {
    const result = getValueByPath(obj, '');
    expect(result.exists).toBeFalsy();
    expect(result.value).toBeUndefined();
  });

  it('should handle non-object input', () => {
    const result = getValueByPath(null as any, 'path');
    expect(result.exists).toBe(false);
    expect(result.value).toBe(undefined);
  });
});
