import { Model, Schema } from 'mongoose';
import { skipCountForward } from './skip-count-forward';
import { findIndex } from './find-index';

jest.mock('./find-index');

// Mocking the mongoose model for testing purposes
const path = jest.fn().mockReturnValue({
  options: {
    unique: jest.fn(),
  },
});

const lean = jest.fn();

const mockModel = {
  schema: {
    path,
  } as unknown as Schema,
  find: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  lean,
} as unknown as jest.Mocked<Model<any>>;

describe('skipCountForward function', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 0 if no cursor is provided', async () => {
    const result = await skipCountForward({
      model: mockModel as Model<any>,
      cursor: undefined,
      sort: [['field', 1]],
      filter: {},
      skipCursor: true,
    });

    expect(result).toBe(0);
  });

  it('should return 0 if the main sorted field is unique (e.g., _id)', async () => {
    path.mockReturnValue({ options: { unique: false } });

    const result = await skipCountForward({
      model: mockModel,
      cursor: { _id: 'some_id' },
      sort: [['_id', 1]],
      filter: {},
      skipCursor: true,
    });

    expect(result).toEqual(0);
  });

  it('should return 0 if the main sorted field is unique and is not _id', async () => {
    path.mockReturnValue({ options: { unique: true } });

    const result = await skipCountForward({
      model: mockModel,
      cursor: { field: 'dsqf' },
      sort: [['field', 1]],
      filter: {},
      skipCursor: true,
    });

    expect(result).toEqual(0);
  });

  it('should calculate the correct count to skip when main sorted field is not unique', async () => {
    path.mockReturnValue({ options: { unique: false } });

    const mockFindResult = [
      { field: 'A' },
      { field: 'B' },
      { field: 'C' },
      // ... more mock documents
    ];

    lean.mockResolvedValue(mockFindResult);

    // no mater what it resolves
    (findIndex as jest.Mock).mockResolvedValue(1);

    const result = await skipCountForward({
      model: mockModel,
      cursor: { field: 'B' },
      sort: [['field', 1]],
      filter: {},
      skipCursor: true,
    });

    // Calculate the expected skip count based on the cursor position in the mockFindResult array
    const expectedSkipCount = 1;

    expect(mockModel.find).toHaveBeenCalledWith({
      $and: [{}, { field: 'B' }],
    });

    expect(findIndex).toHaveBeenCalledWith(
      expect.objectContaining({
        list: mockFindResult,
      }),
    );
  });

  it('should catch error', async () => {
    path.mockImplementation(() => new Error());

    const result = skipCountForward({
      model: mockModel,
      cursor: { field: 'B' },
      sort: [['field', 1]],
      filter: {},
      skipCursor: true,
    });

    expect(result).rejects.toThrow(
      "Cannot read properties of undefined (reading 'unique')",
    );
  });
});
