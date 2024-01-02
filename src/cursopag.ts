import {
  FilterQuery,
  Model,
  ProjectionFields,
  QueryOptions,
  SortOrder,
} from 'mongoose';
import { CursopagResponse, Edge } from './paginated-response.interface';
import {
  cursorPreDecoder,
  cursorEncoder as defaultCursorEncoder,
} from './encode-cursor';
import { normalizeSort } from './normalize-sort';
import { createMainSortedFiledCondition } from './create-main-sorted-filed-condition';
import { getLimitAndDirection } from './get-limit-and-direction';
import { skipCountForward } from './skip-count-forward';
import { skipCountBackward } from './skip-count-backward';
import { createEdgesFromQuery } from './create-edges-from-query';
import { getBackwardScopeQuery } from './get-backward-scope-query';

/**
 * Represents an asynchronous function that retrieves documents in an ascending direction.
 * @template T - The type of the documents.
 * @param {Object} params - The parameters object.
 * @param {Model<T>} params.model - The Mongoose model.
 * @param {Record<string, unknown>} [params.cursor] - The cursor for pagination.
 * @param {FilterQuery<T>} params.filter - The filter query.
 * @param {number} params.limit - The maximum number of documents to retrieve.
 * @param {[string, 1 | -1][]} params.sort - The sorting criteria.
 * @param {ProjectionFields<T> | string | null} [params.projection] - The projection fields.
 * @param {Omit<QueryOptions<T>, 'sort' | 'skip'>} [params.queryOptions] - Additional query options.
 * @param {(cursor: string) => string | Promise<string>} [params.cursorEncoder] - The cursor encoder function.
 * @param {{ doSkip?: boolean }} [params.options] - Additional options.
 * @param {boolean} [params.options.doSkip] - Flag to indicate skipping.
 * @returns {Promise<Edge<T>[]>} The array of edges forward.
 */
export async function forward<T>({
  model,
  cursor,
  filter,
  limit,
  sort,
  projection,
  queryOptions,
  skipCursor,
  cursorEncoder,
}: {
  model: Model<T>;
  cursor?: Record<string, unknown>;
  filter: FilterQuery<T>;
  limit: number;
  sort: [string, 1 | -1][];
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  skipCursor: boolean;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    // Calculate the skip count based on conditions
    const skip = await skipCountForward({
      model,
      cursor,
      sort,
      filter,
      skipCursor,
    });

    // Create conditions for the main sorted field
    const mainSortedFiledCondition = createMainSortedFiledCondition({
      direction: 1,
      cursor,
      mainSort: sort[0],
      schema: model.schema,
      skipCursor,
    });

    // Construct the query for retrieving documents
    const query = model
      .find(
        mainSortedFiledCondition
          ? {
              $and: [filter, mainSortedFiledCondition],
            }
          : filter,
      )
      .sort(sort)
      .select(sort.map((value) => value[0]))
      .skip(skip)
      .limit(limit)
      .lean();

    return createEdgesFromQuery({
      model,
      query,
      projection,
      queryOptions,
      cursorEncoder,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Represents an asynchronous function that retrieves documents in a descending direction.
 * It reverses the sorting order and calls the ascendantDirection function to retrieve documents.
 * @template T - The type of the documents.
 * @param {Object} params - The parameters object.
 * @param {Model<T>} params.model - The Mongoose model.
 * @param {Record<string, unknown>} [params.cursor] - The cursor for pagination.
 * @param {FilterQuery<T>} params.filter - The filter query.
 * @param {number} params.limit - The maximum number of documents to retrieve.
 * @param {[string, 1 | -1][]} params.sort - The sorting criteria.
 * @param {ProjectionFields<T> | string | null} [params.projection] - The projection fields.
 * @param {Omit<QueryOptions<T>, 'sort' | 'skip'>} [params.queryOptions] - Additional query options.
 * @param {(cursor: string) => string | Promise<string>} [params.cursorEncoder] - The cursor encoder function.
 * @param {{ doSkip?: boolean }} [params.options] - Additional options.
 * @returns {Promise<Edge<T>[]>} The array of edges backward.
 */
export async function backward<T>({
  model,
  cursor,
  filter,
  limit: originalLimit,
  sort,
  projection,
  queryOptions,
  skipCursor,
  reqLength,
  cursorEncoder = defaultCursorEncoder,
}: {
  model: Model<T>;
  cursor?: Record<string, unknown>;
  filter: FilterQuery<T>;
  limit: number;
  sort: [string, 1 | -1][];
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  skipCursor: boolean;
  reqLength: number;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    // Calculate the skip count based on conditions
    const { skip, limit } = await getBackwardScopeQuery({
      model,
      filter,
      sort,
      reqLength,
      limit: originalLimit,
      skipCursor,
      cursor,
    });

    if (limit <= 0) return [];

    // Create conditions for the main sorted field
    const mainSortedFiledCondition = createMainSortedFiledCondition({
      direction: -1,
      cursor,
      mainSort: sort[0],
      schema: model.schema,
      skipCursor,
    });

    // Construct the query for retrieving documents
    const query = model
      .find(
        mainSortedFiledCondition
          ? {
              $and: [filter, mainSortedFiledCondition],
            }
          : filter,
      )
      .sort(sort)
      .select(sort.map((value) => value[0]))
      .skip(skip)
      .limit(limit)
      .lean();

    return createEdgesFromQuery({
      model,
      query,
      projection,
      queryOptions,
      cursorEncoder,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieves paginated edges from a Mongoose model based on provided parameters.
 * @template T - The type of documents in the model.
 * @param {Object} params - The parameters object.
 * @param {Model<T>} params.model - The Mongoose model.
 * @param {Record<string, unknown>} [params.cursor] - The cursor for pagination.
 * @param {[string, SortOrder][]} [params.sort] - The sorting criteria.
 * @param {FilterQuery<T>} params.filter - The filter query.
 * @param {number} [params.first] - The number of edges to retrieve from the start.
 * @param {number} [params.last] - The number of edges to retrieve from the end.
 * @param {ProjectionFields<T> | string | null} [params.projection] - The projection fields.
 * @param {Omit<QueryOptions<T>, 'sort' | 'skip'>} [params.queryOptions] - Additional query options.
 * @param {{ doSkip?: boolean }} [params.options] - Additional options.
 * @param {(cursor: string) => Promise<string> | string} [params.cursorEncoder] - The cursor encoder function.
 * @returns {Promise<Edge<T>[]>} The array of edges based on pagination parameters.
 */
export async function getEdges<T>(params: {
  model: Model<T>;
  cursor?: Record<string, unknown>;
  sort?: [string, SortOrder][];
  filter: FilterQuery<T>;
  first?: number;
  last?: number;
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  skipCursor: boolean;
  reqLength: number;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    const { cursor, model, sort, first, last, ...restParams } = params;

    // Normalize sort criteria or default to sorting by _id in ascending order
    const normalizedSort: [string, 1 | -1][] = normalizeSort(sort);

    // Determine pagination direction and limit based on first and last parameters
    const { direction, limit } = getLimitAndDirection({ first, last });

    if (direction === 1) {
      // Paginate in ascending direction
      return forward({
        ...restParams,
        model,
        cursor,
        limit,
        sort: normalizedSort,
      });
    } else {
      // Paginate in descending direction
      return backward({
        ...restParams,
        model,
        cursor,
        limit,
        sort: normalizedSort,
      });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Provides pagination functionality with cursors based on given parameters.
 * Supports forward and backward pagination.
 * @template T - The type of documents in the model.
 * @template Doc - The extended type including _id field.
 * @param {Object} params - The parameters object.
 * @param {Model<T>} params.model - The Mongoose model.
 * @param {FilterQuery<T>} params.filter - The filter query.
 * @param {string} [params.after] - Cursor indicating the starting point for forward pagination.
 * @param {string} [params.before] - Cursor indicating the starting point for backward pagination.
 * @param {number} [params.first] - The number of items to fetch in forward pagination.
 * @param {number} [params.last] - The number of items to fetch in backward pagination.
 * @param {string | { [key: string]: SortOrder } | [string, SortOrder][]} [params.sort=_id:1] - The sorting criteria.
 * @param {ProjectionFields<T> | string | null} [params.projection] - The projection fields.
 * @param {Omit<QueryOptions<T>, 'sort' | 'skip'>} [params.queryOptions] - Additional query options.
 * @param {(encodedCursor: string) => Promise<string> | string} [params.cursorDecoder] - The cursor decoder function.
 * @param {(cursor: string) => Promise<string> | string} [params.cursorEncoder] - The cursor encoder function.
 * @returns {Promise<CursopagResponse<T>>} The paginated response with edges, pageInfo, and totalCount.
 */
export async function cursopag<T>(params: {
  model: Model<T>;
  filter: FilterQuery<T>;
  after?: string;
  before?: string;
  first?: number;
  caslFilter?: FilterQuery<T>;
  last?: number;
  sort?: string | { [key: string]: SortOrder } | [string, SortOrder][];
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  cursorDecoder?: (encodedCursor: string) => Promise<string> | string;
  cursorEncoder?: (cursor: string) => Promise<string> | string;
}): Promise<CursopagResponse<T>> {
  try {
    const { model, after, before, first, last, sort, cursorDecoder } = params;

    if (!first && !last) {
      throw Error('Both first and last are set. Unable to find direction.');
    }

    const filter: FilterQuery<T> = (() => {
      const { filter, caslFilter } = params;
      if (caslFilter) {
        return { $and: [filter, caslFilter] };
      } else {
        return filter;
      }
    })();

    // Initialize the paginated response
    const result: CursopagResponse<T> = {
      totalCount: await model.find(filter).countDocuments(),
      edges: [],
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };

    // If there are no documents, return an empty result
    if (result.totalCount === 0) return result;

    // Decode the cursor if 'after' or 'before' is provided
    const decodedCursor =
      after || before
        ? await cursorPreDecoder({
            after,
            before,
            cursorDecoder,
          })
        : undefined;

    // Normalize the sorting order
    const normalizeSortOrder = normalizeSort(sort);

    // Get the edges based on the given parameters and decoded cursor
    const edges = await getEdges<T>({
      ...params,
      cursor: decodedCursor,
      sort: normalizeSortOrder,
      ...(first && { first: first + 1 }),
      ...(last && { last: last + 1 }),
      skipCursor: true,
      reqLength: result.totalCount,
    });

    // Check for presence of previous edges using cursor
    const previous = !decodedCursor
      ? undefined
      : (
          await getEdges<T>({
            ...params,
            cursor: decodedCursor,
            sort: normalizeSortOrder,
            projection: '_id',
            ...(first && !last && { last: 1, first: undefined }),
            ...(last && !first && { first: 1, last: undefined }),
            skipCursor: false,
            reqLength: result.totalCount,
          })
        ).length !== 0;

    // Determine hasNextPage and hasPreviousPage based on pagination direction
    if (first) {
      if (edges.length > first) {
        result.pageInfo.hasNextPage = true;
        edges.pop();
      }

      result.edges = edges;

      if (previous) {
        result.pageInfo.hasPreviousPage = true;
      }
    } else if (last) {
      if (edges.length > last) {
        result.pageInfo.hasPreviousPage = true;
        edges.shift();
      }

      result.edges = edges;

      if (previous) {
        result.pageInfo.hasNextPage = true;
      }
    }

    // Set startCursor and endCursor in pageInfo
    result.pageInfo.startCursor = edges[0]?.cursor;
    result.pageInfo.endCursor = edges[edges.length - 1]?.cursor;

    return result;
  } catch (error) {
    throw error;
  }
}
