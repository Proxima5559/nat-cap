import { db } from "../config/database";

export interface GraphQLContext {
  db: typeof db;
}

export function createContext(): GraphQLContext {
  return {
    db,
  };
}