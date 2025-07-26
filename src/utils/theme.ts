// 主题色配置
export const theme = {
  // 主色调
  primary: '#85F380',
  // 背景色
  background: '#181819',
  backgroundSecondary: '#262626',
  backgroundTertiary: '#3E3E3E',
  
  // 文字颜色
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  
  // 状态颜色
  success: '#4ECDC4',
  warning: '#FFD93D',
  error: '#FF6B6B',
  info: '#79B1FF',
  
  // 渐变色
  gradient: {
    primary: ['#85F380', '#4ECDC4', '#79B1FF', '#A78BFA'],
    background: ['#181819', '#262626'],
  },
  
  // 阴影
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // 透明度
  opacity: {
    light: 0.1,
    medium: 0.3,
    heavy: 0.7,
  },
};

// 主题色类型定义
export type Theme = typeof theme;

// 导出默认主题
export default theme; 