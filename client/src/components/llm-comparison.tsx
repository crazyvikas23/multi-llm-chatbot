import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLLMQuery } from "@/hooks/use-llm-query";
import { LLMProvider, LLMResponse } from "@shared/schema";
import { Copy, Heart, Moon, Sun, Send, Square, Brain, Bot, AtSign, Sparkles, Zap, Cpu } from "lucide-react";
import { SiGoogle, SiOpenai } from "react-icons/si";
import { useTheme } from "@/components/theme-provider";

interface LLMConfig {
  id: LLMProvider;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  selected: boolean;
  apiKey: string;
}

export default function LLMComparison() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { mutate: queryLLMs, isPending } = useLLMQuery();
  
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState<Record<string, LLMResponse>>({});
  
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([
    {
      id: "openai",
      name: "OpenAI GPT",
      icon: <SiOpenai className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-green-400 via-green-500 to-emerald-600",
      selected: false,
      apiKey: "",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      icon: <Brain className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-orange-400 via-orange-500 to-red-500",
      selected: false,
      apiKey: "",
    },
    {
      id: "google",
      name: "Google Gemini",
      icon: <SiGoogle className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600",
      selected: false,
      apiKey: "",
    },
    {
      id: "cohere",
      name: "Cohere",
      icon: <Cpu className="w-5 h-5 text-white" />,
      gradient: "bg-gradient-to-br from-purple-400 via-purple-500 to-violet-600",
      selected: false,
      apiKey: "",
    },
  ]);

  const selectedLLMs = llmConfigs.filter(llm => llm.selected);

  const handleLLMToggle = (id: LLMProvider, checked: boolean) => {
    setLLMConfigs(prev => 
      prev.map(llm => 
        llm.id === id ? { ...llm, selected: checked } : llm
      )
    );
  };

  const handleApiKeyChange = (id: LLMProvider, apiKey: string) => {
    setLLMConfigs(prev => 
      prev.map(llm => 
        llm.id === id ? { ...llm, apiKey } : llm
      )
    );
  };

  const handleSubmit = () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a query",
        variant: "destructive",
      });
      return;
    }

    const selectedProviders = selectedLLMs.map(llm => llm.id);
    if (selectedProviders.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one LLM provider",
        variant: "destructive",
      });
      return;
    }

    const apiKeys = Object.fromEntries(
      selectedLLMs
        .filter(llm => llm.apiKey.trim())
        .map(llm => [llm.id, llm.apiKey])
    ) as Record<LLMProvider, string>;

    if (Object.keys(apiKeys).length !== selectedProviders.length) {
      toast({
        title: "Error",
        description: "Please provide API keys for all selected providers",
        variant: "destructive",
      });
      return;
    }

    // Initialize loading states
    const initialResponses: Record<string, LLMResponse> = {};
    selectedProviders.forEach(provider => {
      initialResponses[provider] = {
        provider,
        status: 'loading'
      };
    });
    setResponses(initialResponses);

    queryLLMs(
      { query, providers: selectedProviders, apiKeys },
      {
        onSuccess: (data) => {
          setResponses(data.responses);
          toast({
            title: "Success",
            description: "Query completed successfully",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to process query",
            variant: "destructive",
          });
        },
      }
    );
  };

  const copyResponse = async (response: string) => {
    try {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy response",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: LLMResponse['status']) => {
    switch (status) {
      case 'loading':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-0">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Processing
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="border-0">
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Waiting
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-all duration-500">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 rotate-3 hover:rotate-0 transition-transform duration-300">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  LLM Query Comparison
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Compare responses from multiple AI models</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="relative w-12 h-12 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 rotate-0 scale-100 transition-all" />
              ) : (
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/10">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Select AI Models
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Choose which models to compare</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {llmConfigs.map((llm) => (
                  <div key={llm.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={llm.id}
                        checked={llm.selected}
                        onCheckedChange={(checked) => 
                          handleLLMToggle(llm.id, checked as boolean)
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        data-testid={`checkbox-${llm.id}`}
                      />
                      <Label 
                        htmlFor={llm.id} 
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <div className={`w-10 h-10 ${llm.gradient} rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                          {llm.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{llm.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">Latest model</div>
                        </div>
                      </Label>
                    </div>
                    {llm.selected && (
                      <div className="ml-13 space-y-2">
                        <Label className="text-xs text-slate-600 dark:text-slate-400 font-medium">API Key</Label>
                        <Input
                          type="password"
                          placeholder={`Enter ${llm.name} API Key`}
                          value={llm.apiKey}
                          onChange={(e) => handleApiKeyChange(llm.id, e.target.value)}
                          className="h-9 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          data-testid={`input-api-key-${llm.id}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            {/* Query Input */}
            <Card className="mb-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/10">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-500" />
                  Enter Your Query
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Ask any question to compare AI responses</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  placeholder="Type your question or prompt here... For example: 'Explain quantum computing in simple terms' or 'Write a haiku about artificial intelligence'"
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="resize-none bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-base leading-relaxed"
                  data-testid="textarea-query"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="px-3 py-1" data-testid="text-selected-count">
                      {selectedLLMs.length} model{selectedLLMs.length !== 1 ? 's' : ''} selected
                    </Badge>
                    {query.length > 0 && (
                      <Badge variant="secondary" className="px-3 py-1">
                        {query.length} characters
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {isPending && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="shadow-lg hover:shadow-xl transition-all duration-200"
                        data-testid="button-stop"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={isPending}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      data-testid="button-submit"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isPending ? 'Sending...' : 'Send Query'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Panes */}
            <div className="space-y-6">
              {selectedLLMs.map((llm) => {
                const response = responses[llm.id];
                return (
                  <Card key={llm.id} className="overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl shadow-slate-900/10 hover:shadow-2xl transition-all duration-300" data-testid={`card-response-${llm.id}`}>
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 ${llm.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                            {llm.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{llm.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {response && getStatusBadge(response.status)}
                            </div>
                          </div>
                        </div>
                        {response?.response && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyResponse(response.response!)}
                            className="h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                            data-testid={`button-copy-${llm.id}`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="response-content">
                        {response?.status === 'loading' && (
                          <div className="space-y-4 animate-pulse">
                            <div className="flex items-center space-x-3 mb-6">
                              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-slate-600 dark:text-slate-400 font-medium">Generating response...</span>
                            </div>
                            <div className="space-y-3">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
                            </div>
                          </div>
                        )}
                        
                        {response?.response && (
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200/50 dark:border-slate-600/50">
                            <p className="leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-medium">
                              {response.response}
                            </p>
                          </div>
                        )}
                        
                        {response?.error && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                            <p className="text-red-800 dark:text-red-200 font-medium">
                              ⚠️ Error: {response.error}
                            </p>
                          </div>
                        )}
                        
                        {!response && (
                          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                            <div className="text-4xl mb-3">⏱️</div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">Waiting to start...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400 text-lg">
              <span>Made with</span>
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">by Mark</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}