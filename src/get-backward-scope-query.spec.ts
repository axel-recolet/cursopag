import { Model, Document, FilterQuery } from 'mongoose';
import { getBackwardScopeQuery } from './get-backward-scope-query';
import { skipCountBackward } from './skip-count-backward';

// Mocking the skipCountBackward function
jest.mock('./skip-count-backward', () => ({
  skipCountBackward: jest.fn(),
}));

describe('getScopeQuery function', () => {
  let mockModel: Model<Document>;

  beforeEach(() => {
    // Create a mock model instance
    mockModel = {} as Model<Document>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return skip and limit when reqLenght is great than limit and cursor is not provided', async () => {
    const reqLength = 11;
    const limit = 5;

    const result = await getBackwardScopeQuery({
      model: mockModel,
      filter: {},
      sort: [['createdAt', 1]],
      reqLength,
      limit,
      skipCursor: true,
    });

    expect(result).toEqual({ skip: 6, limit });
  });

  it('should return skip and limit when reqLenght is equal to limit and cursor is not provided', async () => {
    const reqLength = 5;
    const limit = 5;

    const result = await getBackwardScopeQuery({
      model: mockModel,
      filter: {},
      sort: [['createdAt', 1]],
      reqLength,
      limit,
      skipCursor: true,
    });

    expect(result).toEqual({ skip: 0, limit });
  });

  it('should return skip and limit when reqLenght is less than to the limit and cursor is not provided', async () => {
    const reqLength = 3;
    const limit = 5;

    const result = await getBackwardScopeQuery({
      model: mockModel,
      filter: {},
      sort: [['createdAt', 1]],
      reqLength,
      limit,
      skipCursor: true,
    });

    expect(result).toEqual({ skip: 0, limit: 3 });
  });

  it('should return correct skip and limit when skipCountBackward is great than limit and cursor is provided', async () => {
    // Mocking the behavior of skipCountBackward
    (skipCountBackward as jest.Mock).mockResolvedValue(7);

    const result = await getBackwardScopeQuery({
      model: mockModel,
      filter: {},
      sort: [['createdAt', -1]],
      reqLength: 10,
      limit: 5,
      skipCursor: false,
      cursor: { _id: 'someId' },
    });

    expect(result).toEqual({ skip: 2, limit: 5 });
    expect(skipCountBackward).toHaveBeenCalled();
  });

  it('should return correct skip and limit when skipCountBackward is less than limit and cursor is provided', async () => {
    // Mocking the behavior of skipCountBackward
    (skipCountBackward as jest.Mock).mockResolvedValue(3);

    const result = await getBackwardScopeQuery({
      model: mockModel,
      filter: {},
      sort: [['createdAt', -1]],
      reqLength: 10,
      limit: 5,
      skipCursor: false,
      cursor: { _id: 'someId' },
    });

    expect(result).toEqual({ skip: 0, limit: 3 });
    expect(skipCountBackward).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const reqLength = 10;
    const limit = 5;
    const cursor = {};
    const sort: [string, 1 | -1][] = [['createdAt', 1]];
    const filter: FilterQuery<Document> = {};
    const skipCursor = true;

    // Mocking an error being thrown by skipCountBackward
    (skipCountBackward as jest.Mock).mockRejectedValue(new Error('Mock error'));

    const result = getBackwardScopeQuery({
      model: mockModel,
      filter,
      sort,
      cursor,
      reqLength,
      limit,
      skipCursor,
    });

    expect(result).rejects.toThrow('Mock error');
  });
});
