
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { validateEnv, logEnvValidationResults } from './lib/envValidator';

// Validate environment variables on startup
const envResult = validateEnv();
logEnvValidationResults(envResult);

// Display a user-friendly error message if environment validation fails
if (!envResult.valid) {
  document.body.innerHTML = `
    <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1 style="color: #e11d48;">Environment Configuration Error</h1>
      <p>Melani OS could not start due to environment configuration issues:</p>
      <ul style="color: #e11d48;">
        ${envResult.errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
      <p>Please check your <code>.env</code> file and make sure all required environment variables are set correctly.</p>
      <p>For setup instructions, see the <a href="./docs/ENVIRONMENT_SETUP.md" style="color: #2563eb;">Environment Setup guide</a>.</p>
    </div>
  `;
  throw new Error('Environment validation failed');
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
