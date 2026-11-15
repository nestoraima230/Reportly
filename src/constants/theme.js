import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#173f39',
    textSecondary: '#666666',
    textMuted: '#999999',
    label: '#333333',
    button: '#2c4d4e',
    buttonText: '#ffffff',
    input: '#ffffff',
    inputBorder: '#cccccc',
    inputText: '#000000',
    inputErrorBg: '#fff8f8',
    link: '#2c4d4e',
    switchText: '#555555',
    activityIndicator: '#2c4d4e',
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    text: '#e0f2ef',
    textSecondary: '#aaaaaa',
    textMuted: '#777777',
    label: '#cccccc',
    button: '#3f7a6b',
    buttonText: '#ffffff',
    input: '#2a2a2a',
    inputBorder: '#444444',
    inputText: '#ffffff',
    inputErrorBg: '#3a1a1a',
    link: '#5fa898',
    switchText: '#aaaaaa',
    activityIndicator: '#5fa898',
  },
};

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
}
