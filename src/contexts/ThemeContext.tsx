
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  wallpaper: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const themes: Theme[] = [
  {
    id: 'default',
    name: 'Space Blue',
    wallpaper: 'https://cdn.leonardo.ai/users/6cd4ea3f-13be-4f8f-8b23-66cb07a2d68b/generations/6e2d59d3-2cf4-4d7a-8484-446785cdfbe0/Leonardo_Kino_XL_A_beautiful_wallpaper_for_a_new_techbased_sle_3.jpg',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#60a5fa'
  },
  {
    id: 'neon',
    name: 'Neon Dreams',
    wallpaper: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070',
    primaryColor: '#ec4899',
    secondaryColor: '#f472b6',
    accentColor: '#fbbf24'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    wallpaper: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    accentColor: '#34d399'
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    wallpaper: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    primaryColor: '#ea580c',
    secondaryColor: '#fb923c',
    accentColor: '#fcd34d'
  }
];

interface ThemeContextType {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('melani-theme');
    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme);
      if (theme) setCurrentTheme(theme);
    }
  }, []);

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem('melani-theme', themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
