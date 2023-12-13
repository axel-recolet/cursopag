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
    expect(result).toBe(42);
  });

  it('should indicate path does not exist', () => {
    expect(() => getValueByPath(obj, 'subDoc.bar.xyz')).toThrow();
  });

  it('should handle incomplete paths', () => {
    const result = getValueByPath(obj, 'subDoc.bar');
    expect(result).toEqual({ foo: 42 });
  });

  it('should handle empty path', () => {
    expect(() => getValueByPath(obj, '')).toThrow();
  });

  it('should handle non-object input', () => {
    expect(() => getValueByPath(null as any, 'path')).toThrow();
  });
});
