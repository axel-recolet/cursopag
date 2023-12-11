import { normalizeStringSelect } from './normalize-select';

describe('normalizeStringSelect function', () => {
  it('should correctly normalize a single select field', () => {
    const result = normalizeStringSelect('field1');
    expect(result).toEqual([['field1', 1]]);
  });

  it('should correctly normalize multiple select fields with unselect indicators', () => {
    const result = normalizeStringSelect('field1 -field2 field3 -field4');
    expect(result).toEqual([
      ['field1', 1],
      ['field2', 0],
      ['field3', 1],
      ['field4', 0],
    ]);
  });

  it('should ignore invalid or empty select fields', () => {
    const result = normalizeStringSelect('- -field1  field2 -');
    expect(result).toEqual([
      ['field1', 0],
      ['field2', 1],
    ]);
  });

  it('should return an empty array for an empty input', () => {
    const result = normalizeStringSelect('');
    expect(result).toEqual([]);
  });

  // Add more test cases to cover different scenarios and edge cases
});
