import colors from '@/constants/colors';

const defaultColors = {
  primary: '#3a7ca5',
  primaryLight: '#e3f2fd',
  secondary: '#81b29a',
  background: '#f8f9fa',
  card: '#ffffff',
  text: '#2d3436',
  textSecondary: '#636e72',
  border: '#e0e0e0',
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  inactive: '#bdc3c7',
};

export function useTheme() {
  return { colors: colors || defaultColors };
}