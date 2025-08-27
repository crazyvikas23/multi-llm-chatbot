import { type Query, type InsertQuery } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getQuery(id: string): Promise<Query | undefined>;
  createQuery(query: InsertQuery): Promise<Query>;
  getRecentQueries(limit?: number): Promise<Query[]>;
}

export class MemStorage implements IStorage {
  private queries: Map<string, Query>;

  constructor() {
    this.queries = new Map();
  }

  async getQuery(id: string): Promise<Query | undefined> {
    return this.queries.get(id);
  }

  async createQuery(insertQuery: InsertQuery): Promise<Query> {
    const id = randomUUID();
    const query: Query = { 
      ...insertQuery, 
      id, 
      createdAt: new Date() 
    };
    this.queries.set(id, query);
    return query;
  }

  async getRecentQueries(limit: number = 10): Promise<Query[]> {
    return Array.from(this.queries.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
