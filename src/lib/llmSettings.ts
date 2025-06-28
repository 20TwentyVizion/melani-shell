
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LLMProvider } from './llmClient';

interface LLMSettings {
  provider: LLMProvider;
  geminiApiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  setProvider: (provider: LLMProvider) => void;
  setGeminiApiKey: (apiKey: string) => void;
  setOllamaUrl: (url: string) => void;
  setOllamaModel: (model: string) => void;
}

export const useLLMSettings = create<LLMSettings>()(
  persist(
    (set) => ({
      provider: 'webllm',
      geminiApiKey: '',
      ollamaUrl: 'http://localhost:11434',
      ollamaModel: 'llama2',
      setProvider: (provider) => set({ provider }),
      setGeminiApiKey: (apiKey) => set({ geminiApiKey: apiKey }),
      setOllamaUrl: (url) => set({ ollamaUrl: url }),
      setOllamaModel: (model) => set({ ollamaModel: model }),
    }),
    {
      name: 'melani-llm-settings',
    }
  )
);
