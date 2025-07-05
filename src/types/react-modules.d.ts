/**
 * React and ReactDOM module declarations
 * This file ensures TypeScript correctly recognizes React and ReactDOM modules
 */

declare module 'react' {
  import * as React from 'react/index';
  export = React;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}
