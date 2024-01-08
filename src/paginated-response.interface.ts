export interface Edge<T> {
  node: T;
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
