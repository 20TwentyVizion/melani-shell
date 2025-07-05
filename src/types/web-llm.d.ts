/**
 * Type declarations for @mlc-ai/web-llm package
 */

declare module '@mlc-ai/web-llm' {
  export interface InitProgressReport {
    progress: number;
    text: string;
    timeElapsed: number;
    totalSize?: number;
    downloadedSize?: number;
  }

  export interface CompletionOptions {
    messages: Array<{
      role: string;
      content: string;
    }>;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string[];
  }

  export interface CompletionResponse {
    choices: Array<{
      message?: {
        content: string;
        role: string;
      };
      finish_reason: string;
    }>;
    created: number;
    id: string;
    model: string;
    usage: {
      completion_tokens: number;
      prompt_tokens: number;
      total_tokens: number;
    };
  }

  export interface ChatInterface {
    completions: {
      create: (options: CompletionOptions) => Promise<CompletionResponse>;
    };
  }

  export interface MLCEngineInterface {
    chat: ChatInterface;
    unload: () => Promise<void>;
    generate: (prompt: string, options?: any) => Promise<string>;
    runtimeStats: () => any;
  }

  export interface MLCEngineOptions {
    initProgressCallback?: (report: InitProgressReport) => void;
    model?: string;
    useWasm?: boolean;
    modelPath?: string;
  }

  export function CreateMLCEngine(
    model: string,
    options?: MLCEngineOptions
  ): Promise<MLCEngineInterface>;
}
