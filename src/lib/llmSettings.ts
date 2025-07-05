
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LLMProvider } from './llmClient';
import { validateEnv } from './envValidator';

// Get validated environment variables
const { env } = validateEnv();

// Define our settings interface
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

// Create the store with proper type annotation
type LLMSettingsStore = (set: any) => LLMSettings;

export const useLLMSettings = create<LLMSettings>(
  persist<LLMSettings>(
    (set) => ({
      provider: env.defaultLLMProvider,
      geminiApiKey: env.geminiApiKey || '',
      ollamaUrl: env.ollamaUrl,
      ollamaModel: env.ollamaModel,
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
