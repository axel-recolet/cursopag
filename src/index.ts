import {
  FilterQuery,
  HydratedDocument,
  Model,
  ProjectionFields,
  QueryOptions,
  Schema,
  SchemaType,
  SortOrder,
} from 'mongoose';
import { CursopagResponse, Edge } from '../types/paginated-response.interface';
import { validateObjectAgainstSchema } from './validate-object-against-schema';
import {
  cursorPreDecoder,
  cursorEncoder as defaultCursorEncoder,
} from './encode-cursor';
import { normalizeSort } from './normalize-sort';
import { getValueByPath } from './get-value-by-path';
import { createMainSortedFiledCondition } from './create-main-sorted-filed-condition';
import { reverseSortOrder } from './normalize-sort';
import { getLimitAndDirection } from './get-limit-and-direction';
import { skipCount } from './skip-count';
import { RankedValue } from './compare-value';
import { EJSON } from 'bson';
import { skipBackward } from './skip-backward';

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
 * @returns {Promise<Edge<T>[]>} The array of edges.
 */
export async function forward<T>({
  model,
  cursor,
  filter,
  limit,
  sort,
  projection,
  queryOptions,
  skipEqual,
  cursorEncoder = defaultCursorEncoder,
}: {
  model: Model<T>;
  cursor?: Record<string, unknown>;
  filter: FilterQuery<T>;
  limit: number;
  sort: [string, 1 | -1][];
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  skipEqual: boolean;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    // Extract the main sorted field
    const mainSortedField = sort[0][0];

    // Get the value of the main sorted field from the cursor
    const { value: mainSortedValue, exists } = getValueByPath(
      cursor ?? {},
      mainSortedField,
    );

    // Check if the main sorted field exists in the cursor
    if (cursor && !exists)
      throw new Error(`${mainSortedField} is not a key of cursor.`);

    // Check if the main sorted field is unique
    const mainSortedFieldIsUnique: boolean =
      mainSortedField === '_id'
        ? true
        : model.schema.path(mainSortedField).options.unique;

    const schemaType = model.schema.path(sort[0][0]);

    const fullCheck: boolean =
      schemaType instanceof Schema.Types.Subdocument ||
      schemaType instanceof Schema.Types.Map ||
      schemaType instanceof Schema.Types.Mixed ||
      schemaType instanceof Schema.Types.Array;

    // Calculate the skip count based on conditions
    const skip =
      !cursor || mainSortedFieldIsUnique
        ? 0
        : await skipCount({
            model,
            cursor,
            sort,
            filter,
            skipEqual,
            fullCheck,
          });

    // Create conditions for the main sorted field
    const mainSortedFiledCondition =
      !cursor || fullCheck
        ? undefined
        : createMainSortedFiledCondition(
            sort[0],
            mainSortedValue,
            model.schema,
            skipEqual,
            1,
          );

    // Construct the query for retrieving documents
    const queryCursor = model
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

    // Array to store results
    const result: {
      node: HydratedDocument<T>;
      cursor: string;
    }[] = [];

    // Iterate through the query results
    for await (const doc of queryCursor) {
      const nodeQuery = model.findById(doc._id, undefined, queryOptions);

      // Apply projection if specified
      if (projection) {
        nodeQuery.projection(projection);
      }

      const node = await nodeQuery;

      // Continue if node is not found
      if (!node) continue;

      // Push node and cursor to result array
      result.push({
        node,
        cursor: await cursorEncoder(EJSON.stringify(doc, { relaxed: false })),
      });
    }

    return result;
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
 * @returns {Promise<Edge<T>[]>} The array of edges in descending order.
 */
export async function backward<T>({
  model,
  cursor,
  filter,
  limit,
  sort,
  projection,
  queryOptions,
  skipEqual,
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
  skipEqual: boolean;
  reqLength: number;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    // Extract the main sorted field
    const mainSortedField = sort[0][0];

    // Get the value of the main sorted field from the cursor
    const { value: mainSortedValue, exists } = getValueByPath(
      cursor ?? {},
      mainSortedField,
    );

    // Check if the main sorted field exists in the cursor
    if (cursor && !exists)
      throw new Error(`${mainSortedField} is not a key of cursor.`);

    // Check if the main sorted field is unique
    const mainSortedFieldIsUnique: boolean =
      mainSortedField === '_id'
        ? true
        : model.schema.path(mainSortedField).options.unique;

    const schemaType = model.schema.path(sort[0][0]);

    // Calculate the skip count based on conditions
    let skip = await (async () => {
      if (mainSortedFieldIsUnique) return 0;
      if (!cursor) return reqLength - limit;

      const skip = await skipBackward({
        model,
        cursor,
        sort,
        filter,
        skipEqual,
      });

      return skip - limit;
    })();

    if (skip < 0) {
      limit += skip;
      skip = 0;
    }

    // Create conditions for the main sorted field
    const mainSortedFiledCondition = !cursor
      ? undefined
      : createMainSortedFiledCondition(
          sort[0],
          mainSortedValue,
          model.schema,
          skipEqual,
          -1,
        );

    // Construct the query for retrieving documents
    const queryCursor =
      limit === 0
        ? []
        : model
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

    // Array to store results
    const result: {
      node: HydratedDocument<T>;
      cursor: string;
    }[] = [];

    // Iterate through the query results
    for await (const doc of queryCursor) {
      const nodeQuery = model.findById(doc._id, undefined, queryOptions);

      // Apply projection if specified
      if (projection) {
        nodeQuery.projection(projection);
      }

      const node = await nodeQuery;

      // Continue if node is not found
      if (!node) continue;

      // Push node and cursor to result array
      result.push({
        node,
        cursor: await cursorEncoder(EJSON.stringify(doc, { relaxed: false })),
      });
    }
    return result;
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
 * @param {<T extends object>(encodedCursor: string) => Promise<T>} [params.decodeCursor] - The cursor decoder function.
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
  skipEqual: boolean;
  reqLength: number;
  decodeCursor?: <T extends object>(encodedCursor: string) => Promise<T>;
}): Promise<Edge<T>[]> {
  try {
    const { cursor, sort, first, last, ...restParams } = params;

    // Normalize sort criteria or default to sorting by _id in ascending order
    const normalizedSort: [string, 1 | -1][] = sort
      ? normalizeSort(sort)
      : [['_id', 1]];

    // Determine pagination direction and limit based on first and last parameters
    const { direction, limit } = getLimitAndDirection({ first, last });

    // Perform pagination with a cursor
    return paginationCursor({
      ...restParams,
      cursor,
      limit,
      direction,
      sort: normalizedSort,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Paginates documents using a cursor and provided parameters.
 * Determines the pagination direction and calls the appropriate direction function.
 * Validates the cursor and throws errors if it doesn't correspond to the schema's model.
 * @template T - The type of documents in the model.
 * @param {Object} params - The parameters object.
 * @param {Model<T>} params.model - The Mongoose model.
 * @param {Record<string, unknown>} [params.cursor] - The cursor for pagination.
 * @param {number} params.limit - The maximum number of documents to retrieve.
 * @param {1 | -1} params.direction - The pagination direction (1 for ascending, -1 for descending).
 * @param {[string, 1 | -1][]} params.sort - The sorting criteria.
 * @param {FilterQuery<T>} params.filter - The filter query.
 * @param {ProjectionFields<T> | string | null} [params.projection] - The projection fields.
 * @param {Omit<QueryOptions<T>, 'sort' | 'skip'>} [params.queryOptions] - Additional query options.
 * @param {{ doSkip?: boolean }} [params.options] - Additional options.
 * @param {(cursor: string) => string | Promise<string>} [params.cursorEncoder] - The cursor encoder function.
 * @returns {Promise<Edge<T>[]>} The array of edges based on pagination with a cursor.
 */
export async function paginationCursor<T>({
  model,
  cursor,
  limit,
  direction,
  sort,
  filter,
  projection,
  queryOptions,
  skipEqual,
  reqLength,
  cursorEncoder,
}: {
  model: Model<T>;
  cursor?: Record<string, unknown>;
  sort: [string, 1 | -1][];
  filter: FilterQuery<T>;
  limit: number;
  direction: 1 | -1;
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  skipEqual: boolean;
  reqLength: number;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    if (cursor) {
      // Validate the cursor against the model's schema
      if (!validateObjectAgainstSchema(cursor, model.schema)) {
        throw new Error(
          "Cursor content doesn't corresponding to the schema's model",
        );
      }

      // Check if the main sorted field exists in the cursor
      const { exists, value } = getValueByPath(cursor, sort[0][0]);
      if (!exists) {
        throw Error('The main sorted field is not present in the cursor.');
      }
    }

    if (direction === 1) {
      // Paginate in ascending direction
      return forward({
        model,
        cursor,
        filter,
        limit,
        sort,
        projection,
        queryOptions,
        skipEqual,
        cursorEncoder,
      });
    } else {
      // Paginate in descending direction
      return backward({
        model,
        cursor,
        filter,
        limit,
        sort,
        projection,
        queryOptions,
        skipEqual,
        reqLength,
        cursorEncoder,
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
  last?: number;
  sort?: string | { [key: string]: SortOrder } | [string, SortOrder][];
  projection?: ProjectionFields<T> | string | null;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  cursorDecoder?: (encodedCursor: string) => Promise<string> | string;
  cursorEncoder?: (cursor: string) => Promise<string> | string;
}): Promise<CursopagResponse<T>> {
  try {
    const {
      model,
      filter,
      after,
      before,
      first,
      last,
      sort = [['_id', 1]],
      cursorDecoder,
    } = params;

    if (!first && !last) {
      throw Error('Both first and last are set. Unable to find direction.');
    }

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
      skipEqual: true,
      reqLength: result.totalCount,
    });

    // Check for presence of previous edges using cursor
    const previous = decodedCursor
      ? (
          await getEdges<T>({
            ...params,
            cursor: decodedCursor,
            sort: normalizeSortOrder,
            projection: '_id',
            ...(first && !last && { last: 1, first: undefined }),
            ...(last && !first && { first: 1, last: undefined }),
            skipEqual: false,
            reqLength: result.totalCount,
          })
        ).length !== 0
      : undefined;

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