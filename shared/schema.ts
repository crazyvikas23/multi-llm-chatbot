import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const queries = pgTable("queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  query: text("query").notNull(),
  responses: jsonb("responses").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuerySchema = createInsertSchema(queries).pick({
  query: true,
  responses: true,
});

export type InsertQuery = z.infer<typeof insertQuerySchema>;
export type Query = typeof queries.$inferSelect;

export const llmProviders = [
  "openai",
  "anthropic", 
  "google",
  "cohere"
] as const;

export type LLMProvider = typeof llmProviders[number];

export interface LLMResponse {
  provider: LLMProvider;
  response?: string;
  error?: string;
  status: 'loading' | 'complete' | 'error' | 'waiting';
}

export interface QueryRequest {
  query: string;
  providers: LLMProvider[];
  apiKeys: Record<LLMProvider, string>;
}
