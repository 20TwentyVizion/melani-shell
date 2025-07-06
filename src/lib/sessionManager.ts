/**
 * Session Manager
 * 
 * Centralizes session state management and rehydration to prevent
 * white screens and maintain user state across page loads.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionManagerState {
  // Session information
  isSessionActive: boolean;
  lastActive: number;
  sessionErrors: Array<{
    timestamp: number;
    message: string;
    stack?: string;
  }>;
  
  // Session actions
  markSessionActive: (isActive: boolean) => void;
  recordError: (error: Error) => void;
  clearErrors: () => void;
  
  // App state verification
  verifyAppState: () => boolean;
}

/**
 * Global session manager for tracking session health and managing recovery
 */
export const useSessionManager = create<SessionManagerState>(
  persist<SessionManagerState>(
    (set, get) => ({
      // Default state
      isSessionActive: true,
      lastActive: Date.now(),
      sessionErrors: [],
      
      // Update session activity status
      markSessionActive: (isActive: boolean) => set(state => ({
        isSessionActive: isActive,
        lastActive: isActive ? Date.now() : state.lastActive
      })),
      
      // Record errors that occur during the session
      recordError: (error: Error) => set(state => ({
        sessionErrors: [
          ...state.sessionErrors,
          {
            timestamp: Date.now(),
            message: error.message,
            stack: error.stack,
          }
        ].slice(-10) // Keep only the last 10 errors
      })),
      
      // Clear all recorded errors
      clearErrors: () => set({ sessionErrors: [] }),
      
      // Check if app state is valid and can be safely rehydrated
      verifyAppState: () => {
        // Here we can add additional checks for critical app state
        // For now, just return true if we haven't had too many errors
        const { sessionErrors } = get();
        
        // If there are too many recent errors, suggest a fresh start
        const recentErrorCount = sessionErrors.filter(
          error => (Date.now() - error.timestamp) < 5 * 60 * 1000 // 5 minutes
        ).length;
        
        return recentErrorCount < 3; // Allow up to 3 errors in recent history
      }
    }),
    {
      name: 'melani-session-storage',
      storage: localStorage,
      partialize: (state) => ({
        // Only persist these fields to avoid storage issues
        lastActive: state.lastActive,
        sessionErrors: state.sessionErrors,
      }),
    }
  )
);

/**
 * Handles visibility change events to manage session state
 */
export const handleVisibilityChange = (isVisible: boolean) => {
  // Update session active state
  const sessionManager = useSessionManager.getState();
  sessionManager.markSessionActive(isVisible);
  
  // Here we could trigger rehydration of critical state if becoming visible
  if (isVisible) {
    console.log('[SessionManager] Tab is visible, checking app state...');
    const appStateValid = sessionManager.verifyAppState();
    
    if (!appStateValid) {
      console.warn('[SessionManager] App state appears to be corrupted, consider reset');
      // In a real implementation, we could trigger a controlled reset here
    }
  }
};

/**
 * Prepare the app for unloading (refresh, close, etc.)
 */
export const handleBeforeUnload = () => {
  // Mark session as inactive
  const sessionManager = useSessionManager.getState();
  sessionManager.markSessionActive(false);
  
  // Any additional cleanup or state synchronization can happen here
  console.log('[SessionManager] Preparing for page unload, syncing state...');
};

/**
 * Resets the application state to handle recovery from errors
 */
export const resetAppState = () => {
  console.log('[SessionManager] Performing controlled reset of application state');
  
  // Clear session errors
  const sessionManager = useSessionManager.getState();
  sessionManager.clearErrors();
  
  // Here we would reset any corrupted state or force rehydration
  // This is app-specific and would need to be customized
  
  // For a complete reset, we could clear storage entirely:
  // localStorage.clear();
  
  // For a controlled reset, we could only clear specific keys
  
  // Mark session as active again
  sessionManager.markSessionActive(true);
  
  return true;
};
