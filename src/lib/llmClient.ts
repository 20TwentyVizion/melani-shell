
import * as webllm from "@mlc-ai/web-llm";

export type LLMProvider = 'webllm' | 'gemini' | 'ollama';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
  ollamaUrl?: string;
  model?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  error?: string;
}

export class LLMClient {
  private config: LLMConfig;
  private webllmEngine: webllm.MLCEngineInterface | null = null;
  private isWebLLMLoaded = false;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async initialize(onProgress?: (progress: string) => void): Promise<boolean> {
    try {
      if (this.config.provider === 'webllm') {
        return await this.initializeWebLLM(onProgress);
      }
      // Gemini and Ollama don't need initialization
      return true;
    } catch (error) {
      console.error('Failed to initialize LLM:', error);
      return false;
    }
  }

  private async initializeWebLLM(onProgress?: (progress: string) => void): Promise<boolean> {
    if (this.isWebLLMLoaded && this.webllmEngine) {
      return true;
    }

    try {
      const initProgressCallback = (report: webllm.InitProgressReport) => {
        const progressText = `${report.text} (${(report.progress * 100).toFixed(1)}%)`;
        onProgress?.(progressText);
      };

      this.webllmEngine = await webllm.CreateMLCEngine(
        "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
        { initProgressCallback }
      );

      this.isWebLLMLoaded = true;
      return true;
    } catch (error) {
      console.error('WebLLM initialization failed:', error);
      return false;
    }
  }

  async chat(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number } = {}): Promise<LLMResponse> {
    try {
      switch (this.config.provider) {
        case 'webllm':
          return await this.chatWebLLM(messages, options);
        case 'gemini':
          return await this.chatGemini(messages, options);
        case 'ollama':
          return await this.chatOllama(messages, options);
        default:
          return { content: '', error: 'Unknown LLM provider' };
      }
    } catch (error) {
      console.error('Chat error:', error);
      return { content: '', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async chatWebLLM(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    if (!this.webllmEngine || !this.isWebLLMLoaded) {
      return { content: '', error: 'WebLLM not initialized' };
    }

    const completion = await this.webllmEngine.chat.completions.create({
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 150,
    });

    const content = completion.choices[0]?.message?.content || '';
    return { content };
  }

  private async chatGemini(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    if (!this.config.apiKey) {
      return { content: '', error: 'Gemini API key not provided' };
    }

    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages.filter(msg => msg.role !== 'system'),
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 150,
        },
      }),
    });

    if (!response.ok) {
      return { content: '', error: `Gemini API error: ${response.statusText}` };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { content };
  }

  private async chatOllama(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }): Promise<LLMResponse> {
    const ollamaUrl = this.config.ollamaUrl || 'http://localhost:11434';
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 150,
        },
      }),
    });

    if (!response.ok) {
      return { content: '', error: `Ollama API error: ${response.statusText}` };
    }

    const data = await response.json();
    const content = data.message?.content || '';
    return { content };
  }

  updateConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
  }

  isInitialized(): boolean {
    if (this.config.provider === 'webllm') {
      return this.isWebLLMLoaded;
    }
    return true; // Gemini and Ollama don't need initialization
  }

  getProvider(): LLMProvider {
    return this.config.provider;
  }
}
