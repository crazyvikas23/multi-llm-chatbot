import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { LLMService } from "./services/llm";
import { insertQuerySchema, type LLMProvider, type LLMResponse, type QueryRequest } from "@shared/schema";
import { z } from "zod";

const queryRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
  providers: z.array(z.enum(["openai", "anthropic", "google", "cohere"])),
  apiKeys: z.record(z.string(), z.string()),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Query multiple LLMs
  app.post("/api/query", async (req, res) => {
    try {
      const { query, providers, apiKeys } = queryRequestSchema.parse(req.body);
      
      const llmService = new LLMService(apiKeys as Record<LLMProvider, string>);
      const responses: Record<string, LLMResponse> = {};

      // Initialize all responses as waiting
      providers.forEach(provider => {
        responses[provider] = {
          provider,
          status: 'waiting'
        };
      });

      // Query all providers concurrently
      const promises = providers.map(async (provider: LLMProvider) => {
        try {
          responses[provider].status = 'loading';
          const response = await llmService.queryProvider(provider, query);
          responses[provider] = {
            provider,
            response,
            status: 'complete'
          };
        } catch (error) {
          responses[provider] = {
            provider,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            status: 'error'
          };
        }
      });

      await Promise.allSettled(promises);

      // Save query and responses to storage
      const savedQuery = await storage.createQuery({
        query,
        responses
      });

      res.json({
        id: savedQuery.id,
        responses
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: error instanceof Error ? error.message : "Internal server error" 
        });
      }
    }
  });

  // Get query history
  app.get("/api/queries", async (req, res) => {
    try {
      const queries = await storage.getRecentQueries(10);
      res.json(queries);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Get specific query
  app.get("/api/queries/:id", async (req, res) => {
    try {
      const query = await storage.getQuery(req.params.id);
      if (!query) {
        res.status(404).json({ message: "Query not found" });
        return;
      }
      res.json(query);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
