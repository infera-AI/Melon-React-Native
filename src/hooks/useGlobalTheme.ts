// src/hooks/useGlobalTheme.ts
import { useTheme } from '@/contexts/ThemeContext';

export const useGlobalTheme = () => {
  const { globalTheme, colors } = useTheme();
  
  return {
    // 快速应用主题到现有样式
    apply: (baseStyle: any) => globalTheme.apply(baseStyle),

    // 快速应用Item样式
    applyItem: (baseStyle: any) => globalTheme.applyItem(baseStyle),

    // 快速文字样式
    text: globalTheme.text,
    textSecondary: globalTheme.textSecondary,
    
    // 快速背景样式
    bg: globalTheme.bg,
    
    // 颜色对象
    colors,
  };
};
