// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyGlobalTheme } from '@/utils/globalTheme';
import theme from '@/utils/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  globalTheme: any; // 新增全局主题对象
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

interface ThemeColors {
  // 基础颜色
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;

  // 功能颜色
  success: string;
  warning: string;
  error: string;
  info: string;

  // 特殊颜色
  card: string;
  overlay: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  card: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors: ThemeColors = {
  primary: theme.primary,
  secondary: theme.textSecondary,
  background: theme.background,
  surface: theme.backgroundSecondary,
  text: theme.textPrimary,
  textSecondary: '#8E8E93',
  border: '#38383A',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  card: '#1C1C1E',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isDark, setIsDark] = useState(false);

  // 从存储中加载主题设置
  useEffect(() => {
    loadThemeMode();
  }, []);

  // 根据主题模式更新颜色
  useEffect(() => {
    const shouldBeDark =
      themeMode === 'dark' ||
      (themeMode === 'system' && systemColorScheme === 'dark');

    setIsDark(shouldBeDark);
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        // setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('加载主题设置失败:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      // setThemeModeState(mode);
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const colors = isDark ? darkColors : lightColors;
  const globalTheme = applyGlobalTheme(colors); // 新增

  return (
    <ThemeContext.Provider value={{
      themeMode,
      isDark,
      colors,
      globalTheme, // 新增
      setThemeMode,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};