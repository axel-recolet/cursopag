import { getLimitAndDirection } from './get-limit-and-direction';

describe('getLimitAndDirection function', () => {
  it('should return the limit and direction for "first" parameter', () => {
    const result = getLimitAndDirection({ first: 5 });
    expect(result).toEqual({ direction: 1, limit: 5 });
  });

  it('should return the limit and direction for "last" parameter', () => {
    const result = getLimitAndDirection({ last: 10 });
    expect(result).toEqual({ direction: -1, limit: 10 });
  });

  it('should throw an error when neither "first" nor "last" parameter is provided', () => {
    expect(() => {
      getLimitAndDirection({});
    }).toThrow('Neither first nor last is set. Unable to find direction.');
  });

  it('should throw an error when both "first" and "last" parameters are provided', () => {
    expect(() => {
      getLimitAndDirection({ first: 5, last: 10 });
    }).toThrow('Both first and last are set. Unable to find direction.');
  });

  it('should throw an error for unexpected scenarios', () => {
    const params: any = { invalidParam: 5 };
    expect(() => {
      getLimitAndDirection(params);
    }).toThrow('Neither first nor last is set. Unable to find direction.');
  });
});
