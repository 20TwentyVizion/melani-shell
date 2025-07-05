/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_DEFAULT_LLM_PROVIDER: 'webllm' | 'gemini' | 'ollama';
  readonly VITE_OLLAMA_URL: string;
  readonly VITE_OLLAMA_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
