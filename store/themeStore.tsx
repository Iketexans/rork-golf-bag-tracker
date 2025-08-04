import React, { createContext, useContext, ReactNode } from 'react';
import colorsImport from '@/constants/colors';

const defaultColors = {
  primary: '#1B5E20',
  primaryLight: '#E8F5E8',
  secondary: '#2E7D32',
  accent: '#C8E6C9',
  background: '#FAFAFA',
  card: '#FFFFFF',
  text: '#1B1B1B',
  textSecondary: '#616161',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  inactive: '#BDBDBD',
  gold: '#FFD700',
  clubGreen: '#0D4F0C',
  fairwayGreen: '#228B22',
};

type ThemeContextType = {
  colors: typeof defaultColors;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeValue = {
    colors: colorsImport || defaultColors,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}