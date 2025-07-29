import createContextHook from '@nkzw/create-context-hook';
import { lightColors } from '@/constants/colors';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const colors = lightColors;

  return {
    colors,
  };
});