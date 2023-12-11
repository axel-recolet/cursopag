import {
  isAscending,
  isDescending,
  normalizeArraySort,
  normalizeRecordSort,
  normalizeSort,
  normalizeStringSort,
  reverseSortOrder,
} from './normalize-sort';

describe('isAscending function', () => {
  it('should return true for valid ascending directions: "asc"', () => {
    expect(isAscending('asc')).toBe(true);
  });

  it('should return true for valid ascending directions: "ascending"', () => {
    expect(isAscending('ascending')).toBe(true);
  });

  it('should return true for valid ascending directions: 1', () => {
    expect(isAscending(1)).toBe(true);
  });

  it('should return false for invalid ascending directions: "desc"', () => {
    expect(isAscending('desc')).toBe(false);
  });

  it('should return false for invalid ascending directions: 0', () => {
    expect(isAscending(0)).toBe(false);
  });
});

describe('isDescending function', () => {
  it('should return true for valid descending directions: "desc"', () => {
    expect(isDescending('desc')).toBe(true);
  });

  it('should return true for valid descending directions: "descending"', () => {
    expect(isDescending('descending')).toBe(true);
  });

  it('should return true for valid descending directions: -1', () => {
    expect(isDescending(-1)).toBe(true);
  });

  it('should return false for invalid descending directions: "asc"', () => {
    expect(isDescending('asc')).toBe(false);
  });

  it('should return false for invalid descending directions: 0', () => {
    expect(isDescending(0)).toBe(false);
  });
});

describe('normalizeStringSort function', () => {
  it('should return an empty array for an empty string', () => {
    const result = normalizeStringSort('');
    expect(result).toEqual([]);
  });

  it('should correctly parse a single sort field without DESC', () => {
    const result = normalizeStringSort('fieldName');
    expect(result).toEqual([['fieldName', 1]]);
  });

  it('should correctly parse a single sort field with DESC', () => {
    const result = normalizeStringSort('-fieldName');
    expect(result).toEqual([['fieldName', -1]]);
  });

  it('should correctly parse multiple sort fields', () => {
    const result = normalizeStringSort('field1 -field2 field3');
    expect(result).toEqual([
      ['field1', 1],
      ['field2', -1],
      ['field3', 1],
    ]);
  });
});

describe('normalizeRecordSort function', () => {
  it('should return an empty array for an empty object', () => {
    const result = normalizeRecordSort({});
    expect(result).toEqual([]);
  });

  it('should correctly parse a single field with ascending order', () => {
    const result = normalizeRecordSort({ fieldName: 'asc' });
    expect(result).toEqual([['fieldName', 1]]);
  });

  it('should correctly parse multiple fields with mixed orders', () => {
    const result = normalizeRecordSort({
      field1: 'desc',
      field2: 'asc',
      field3: 'asc',
    });
    expect(result).toEqual([
      ['field1', -1],
      ['field2', 1],
      ['field3', 1],
    ]);
  });
});

describe('normalizeArraySort function', () => {
  it('should return an empty array for an empty input', () => {
    const result = normalizeArraySort([]);
    expect(result).toEqual([]);
  });

  it('should correctly parse a single field with ascending order', () => {
    const result = normalizeArraySort([['fieldName', 'asc']]);
    expect(result).toEqual([['fieldName', 1]]);
  });

  it('should correctly parse multiple fields with mixed orders', () => {
    const result = normalizeArraySort([
      ['field1', 'desc'],
      ['field2', 'ascending'],
      ['field3', 1],
    ]);
    expect(result).toEqual([
      ['field1', -1],
      ['field2', 1],
      ['field3', 1],
    ]);
  });
});

describe('normalizeSort function', () => {
  it('should correctly normalize a string representation of sorting criteria', () => {
    const result = normalizeSort('-field1 field2');
    expect(result).toEqual([
      ['field1', -1],
      ['field2', 1],
      ['_id', 1],
    ]);
  });

  it('should correctly normalize sorting criteria from an array', () => {
    const result = normalizeSort([
      ['field1', 'desc'],
      ['field2', 1],
      ['field3', 'ascending'],
    ]);
    expect(result).toEqual([
      ['field1', -1],
      ['field2', 1],
      ['field3', 1],
      ['_id', 1],
    ]);
  });

  it('should correctly normalize sorting criteria from an object', () => {
    const result = normalizeSort({
      field1: -1,
      field2: 'asc',
      field3: 'descending',
    });
    expect(result).toEqual([
      ['field1', -1],
      ['field2', 1],
      ['field3', -1],
      ['_id', 1],
    ]);
  });
});

describe('reverseSortOrder function', () => {
  it('should reverse the sort order from ascending to descending', () => {
    const inputSort: [string, 1 | -1][] = [
      ['field1', 1],
      ['field2', -1],
    ];

    const reversedSort = reverseSortOrder(inputSort);

    expect(reversedSort).toEqual([
      ['field1', -1],
      ['field2', 1],
    ]);
  });

  it('should handle an empty array and return an empty array', () => {
    const inputSort: [string, 1 | -1][] = [];
    const reversedSort = reverseSortOrder(inputSort);

    expect(reversedSort).toEqual([]);
  });

  it('should reverse the sort order even with multiple fields', () => {
    const inputSort: [string, 1 | -1][] = [
      ['age', 1],
      ['name', -1],
      ['createdAt', 1],
    ];

    const reversedSort = reverseSortOrder(inputSort);

    expect(reversedSort).toEqual([
      ['age', -1],
      ['name', 1],
      ['createdAt', -1],
    ]);
  });

  it('should not modify the original array', () => {
    const inputSort: [string, 1 | -1][] = [
      ['field1', 1],
      ['field2', -1],
    ];
    const originalInputSort = [...inputSort];

    reverseSortOrder(inputSort);

    expect(inputSort).toEqual(originalInputSort);
  });

  it('should throw an error if an issue occurs during sorting', () => {
    const invalidSort: any = null;

    // Expecting an error to be thrown when the input is invalid
    expect(() => {
      reverseSortOrder(invalidSort);
    }).toThrow();
  });
});
