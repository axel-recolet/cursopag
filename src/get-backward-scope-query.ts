import { FilterQuery, Model } from 'mongoose';
import { skipCountBackward } from './skip-count-backward';

export async function getBackwardScopeQuery<T>({
  cursor,
  reqLength,
  limit,
  model,
  sort,
  filter,
  skipCursor,
}: {
  model: Model<T>;
  filter: FilterQuery<T>;
  sort: [string, 1 | -1][];
  cursor?: Record<string, unknown>;
  reqLength: number;
  limit: number;
  skipCursor: boolean;
}): Promise<{ skip: number; limit: number }> {
  try {
    if (!cursor) {
      if (reqLength >= limit) {
        return { skip: reqLength - limit, limit };
      } else {
        return { skip: 0, limit: reqLength };
      }
    }

    const start = await skipCountBackward({
      model,
      cursor,
      sort,
      filter,
      skipCursor,
    });

    const skip = start - limit;

    if (skip >= 0) {
      return { skip, limit };
    } else {
      return { skip: 0, limit: start };
    }
  } catch (error) {
    throw error;
  }
}
