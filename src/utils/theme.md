# 主题色系统使用指南

## 概述
本项目已引入统一的主题色系统，所有颜色都通过 `theme` 对象进行管理，便于维护和统一风格。

## 主题色配置

### 主色调
- `theme.primary`: '#85F380' - 主要绿色
- `theme.primaryDark`: '#6BCF66' - 深绿色
- `theme.primaryLight`: '#A8F8A3' - 浅绿色

### 背景色
- `theme.background`: '#181819' - 主背景色
- `theme.backgroundSecondary`: '#262626' - 次要背景色
- `theme.backgroundTertiary`: '#3E3E3E' - 第三级背景色

### 文字颜色
- `theme.textPrimary`: '#FFFFFF' - 主要文字颜色
- `theme.textSecondary`: '#B0B0B0' - 次要文字颜色
- `theme.textTertiary`: '#808080' - 第三级文字颜色

### 状态颜色
- `theme.success`: '#4ECDC4' - 成功状态
- `theme.warning`: '#FFD93D' - 警告状态
- `theme.error`: '#FF6B6B' - 错误状态
- `theme.info`: '#79B1FF' - 信息状态

### 渐变色
- `theme.gradient.primary`: ['#85F380', '#4ECDC4', '#79B1FF', '#A78BFA']
- `theme.gradient.background`: ['#181819', '#262626']

## 使用方法

### 1. 导入主题
```typescript
import theme from '../../utils/theme';
```

### 2. 在样式中使用
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
  },
  text: {
    color: theme.textPrimary,
  },
  button: {
    backgroundColor: theme.primary,
  },
});
```

### 3. 在组件中使用
```typescript
<View style={{ backgroundColor: theme.backgroundSecondary }}>
  <Text style={{ color: theme.textSecondary }}>示例文字</Text>
</View>
```

## 已更新的文件
- ✅ `src/screens/Auth/RegisterEmailScreen.tsx`
- ✅ `src/screens/Auth/WelcomeScreen.tsx`

## 注意事项
1. 避免在代码中直接使用硬编码颜色值
2. 新增颜色时请在 `theme.ts` 中定义
3. 保持颜色命名的一致性和语义化
4. 如需修改主题色，只需在 `theme.ts` 中修改即可全局生效

## 扩展建议
- 可考虑添加深色/浅色主题切换功能
- 可添加品牌色变量用于不同场景
- 可考虑添加颜色透明度配置 