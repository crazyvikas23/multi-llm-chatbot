import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LLMProvider, LLMResponse } from "@shared/schema";

interface QueryRequest {
  query: string;
  providers: LLMProvider[];
  apiKeys: Record<LLMProvider, string>;
}

interface QueryResponse {
  id: string;
  responses: Record<string, LLMResponse>;
}

export function useLLMQuery() {
  return useMutation({
    mutationFn: async (request: QueryRequest): Promise<QueryResponse> => {
      const response = await apiRequest("POST", "/api/query", request);
      return response.json();
    },
  });
}
