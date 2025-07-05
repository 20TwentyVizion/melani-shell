# Environment Setup for Melani OS

This guide explains how to set up environment variables for Melani OS development.

## Environment Variables

Melani OS uses environment variables to manage configuration settings like API keys and provider defaults. These variables are loaded from a `.env` file at the root of the project.

### Required Environment Files

1. `.env` - Contains your actual configuration values (not committed to version control)
2. `.env.example` - A template showing required variables (committed to version control)

### Setting Up Your Environment

1. Create a `.env` file in the project root (or copy from `.env.example`)
2. Fill in the required values as described below

## Available Environment Variables

### Google Gemini API

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Google Gemini API key:
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Navigate to "Get API key"
4. Create a new API key or use an existing one
5. Copy the key into your `.env` file

### LLM Provider Configuration

```
VITE_DEFAULT_LLM_PROVIDER=gemini
```

Available options:
- `gemini` - Use Google Gemini API (requires API key)
- `webllm` - Use local WebLLM (runs in browser, no API key needed)
- `ollama` - Use local Ollama server (requires Ollama installation)

### Ollama Configuration

If using Ollama as your LLM provider:

```
VITE_OLLAMA_URL=http://localhost:11434
VITE_OLLAMA_MODEL=llama2
```

- `VITE_OLLAMA_URL` - URL of your Ollama server
- `VITE_OLLAMA_MODEL` - Model name to use with Ollama

## Development Workflow

1. For local development:
   ```bash
   # Start the development server
   npm run dev
   ```

2. For production build:
   ```bash
   # Build for production
   npm run build
   ```

## Troubleshooting

If you encounter issues with environment variables:

1. Verify that your `.env` file exists in the project root
2. Check that all required variables are properly defined
3. Restart the development server to load new environment variables
4. Clear browser cache and local storage if needed

## Security Notes

- Never commit your `.env` file containing actual API keys to version control
- The `.env` file is excluded from Git in the `.gitignore` file
- Only use `.env.example` for showing the structure without actual keys
