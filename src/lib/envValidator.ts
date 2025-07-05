/**
 * Environment Variable Validation Utility
 * 
 * This module validates that required environment variables are present and properly formatted.
 * It provides clear error messages and ensures the application has the configuration it needs.
 */

export type LLMProvider = 'webllm' | 'gemini' | 'ollama';
const VALID_PROVIDERS: LLMProvider[] = ['webllm', 'gemini', 'ollama'];

interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidatedEnv {
  geminiApiKey: string | null;
  defaultLLMProvider: LLMProvider;
  ollamaUrl: string;
  ollamaModel: string;
}

/**
 * Validates all environment variables and returns their validated values
 */
export function validateEnv(): EnvValidationResult & { env: ValidatedEnv } {
  const result: EnvValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  // Get environment variables with fallbacks
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;
  const defaultProvider = import.meta.env.VITE_DEFAULT_LLM_PROVIDER as LLMProvider || 'gemini';
  const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
  const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL || 'llama2';

  // Validate LLM Provider
  if (!VALID_PROVIDERS.includes(defaultProvider)) {
    result.errors.push(
      `Invalid LLM provider: "${defaultProvider}". Must be one of: ${VALID_PROVIDERS.join(', ')}`
    );
    result.valid = false;
  }

  // Check for provider-specific requirements
  if (defaultProvider === 'gemini' && !geminiApiKey) {
    result.errors.push(
      'Gemini API key is required when using the Gemini provider. Add VITE_GEMINI_API_KEY to your .env file.'
    );
    result.valid = false;
  }

  // Add warnings for missing optional configs
  if (defaultProvider === 'ollama') {
    if (ollamaUrl === 'http://localhost:11434') {
      result.warnings.push(
        'Using default Ollama URL. If your Ollama server is running elsewhere, set VITE_OLLAMA_URL in your .env file.'
      );
    }
    
    if (ollamaModel === 'llama2') {
      result.warnings.push(
        'Using default Ollama model (llama2). Set VITE_OLLAMA_MODEL in your .env file to use a different model.'
      );
    }
  }

  // Return validation result and validated environment variables
  return {
    ...result,
    env: {
      geminiApiKey,
      defaultLLMProvider: defaultProvider,
      ollamaUrl,
      ollamaModel,
    },
  };
}

/**
 * Display environment validation errors and warnings in the console
 */
export function logEnvValidationResults(result: EnvValidationResult): void {
  if (result.errors.length > 0) {
    console.error('❌ Environment validation errors:');
    result.errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (result.valid && result.warnings.length === 0) {
    console.log('✅ Environment validation successful');
  }
}
