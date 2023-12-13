import {
  FlattenMaps,
  HydratedDocument,
  IfAny,
  Model,
  Query,
  Document,
  Require_id,
  QueryOptions,
  ProjectionFields,
} from 'mongoose';
import { cursorEncoder as defaultCursorEncoder } from './encode-cursor';
import { Edge } from './paginated-response.interface';
import { EJSON } from 'bson';

export async function createEdgesFromQuery<T>({
  model,
  query,
  queryOptions,
  projection,
  cursorEncoder = defaultCursorEncoder,
}: {
  model: Model<T>;
  query: Query<
    Require_id<FlattenMaps<T>>[],
    IfAny<T, any, Document<unknown, {}, T> & Require_id<T>>,
    {},
    T,
    'find'
  >;
  queryOptions?: Omit<QueryOptions<T>, 'sort' | 'skip'>;
  projection?: ProjectionFields<T> | string | null;
  cursorEncoder?: (cursor: string) => string | Promise<string>;
}): Promise<Edge<T>[]> {
  try {
    // Array to store results
    const result: {
      node: HydratedDocument<T>;
      cursor: string;
    }[] = [];

    // Iterate through the query results
    for await (const doc of query) {
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
