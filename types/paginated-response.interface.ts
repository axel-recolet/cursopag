import mongoose, { Document, HydratedDocument } from 'mongoose';

export interface Edge<T> {
  node: HydratedDocument<T>;
  cursor: string;
}

export interface PageInfo {
  startCursor?: string;
  hasPreviousPage: boolean;
  endCursor?: string;
  hasNextPage: boolean;
}

export interface CursopagResponse<T> {
  totalCount: number;
  edges: Edge<T>[];
  pageInfo: PageInfo;
}
