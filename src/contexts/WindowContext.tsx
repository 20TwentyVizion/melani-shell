
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WindowState {
  id: string;
  title: string;
  component: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface WindowContextType {
  windows: WindowState[];
  openWindow: (window: Omit<WindowState, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);

  const openWindow = (window: Omit<WindowState, 'id' | 'zIndex' | 'isMinimized' | 'isMaximized'>) => {
    const id = Date.now().toString();
    const newWindow: WindowState = {
      ...window,
      id,
      zIndex: nextZIndex,
      isMinimized: false,
      isMaximized: false
    };
    
    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
    return id;
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  };

  return (
    <WindowContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindow
    }}>
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
};
