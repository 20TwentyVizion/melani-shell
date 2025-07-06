import React, { useEffect } from 'react';

interface SessionVisibilityHandlerProps {
  onVisibilityChange?: (isVisible: boolean) => void;
  onBeforeUnload?: () => void;
}

/**
 * SessionVisibilityHandler Component
 * 
 * Monitors browser tab visibility and handles page unload events
 * to preserve application state and improve user experience.
 */
const SessionVisibilityHandler: React.FC<SessionVisibilityHandlerProps> = ({
  onVisibilityChange,
  onBeforeUnload,
}) => {
  useEffect(() => {
    // Handle visibility change
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      
      console.log(`[SessionHandler] Visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      
      if (onVisibilityChange) {
        onVisibilityChange(isVisible);
      }
    };

    // Handle before unload (page refresh, tab close)
    const handleBeforeUnload = () => {
      console.log('[SessionHandler] Page is being unloaded');
      
      if (onBeforeUnload) {
        onBeforeUnload();
      }
    };

    // Attach event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initial check
    if (onVisibilityChange) {
      onVisibilityChange(document.visibilityState === 'visible');
    }

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onVisibilityChange, onBeforeUnload]);

  // This component doesn't render anything
  return null;
};

export default SessionVisibilityHandler;
