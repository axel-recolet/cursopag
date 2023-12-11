import { squire } from '@ucast/mongo2js';

describe('squire', () => {
  it('should ', async () => {
    const test = squire({
      $gt: 18,
    });

    expect(test(18)).toBeFalsy();
    expect(test(20)).toBeTruthy(); // true
    expect(test(9)).toBeFalsy(); // false
    expect(test(undefined)).toBeFalsy();
    expect(test('z')).toBeFalsy();
  });

  it('should ', async () => {
    const test = squire({
      $lt: 18,
    });

    expect(test(undefined)).toBeTruthy();
    expect(test('a')).toBeTruthy();
  });
});
