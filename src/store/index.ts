// 状态管理统一导出，组件中就可以import { useUserStore } from '@/stores';   不导出时只能完整路径import { useUserStore } from '../stores/modules/user.store';
export * from './modules/user.store';
export * from './modules/app.store';
export * from './modules/voice.store';
export * from './modules/points.store';
export * from './authSlice';
export * from './userSlice';
