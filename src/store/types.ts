import type { UserState } from './modules/user.store';
// import { AppState } from './modules/app.store'; 假设还有其他store
// export type RootState = UserState & AppState; // 就可以合并所有Store类型，实现类型共享，不用重复定义

export type RootState = UserState; // 合并所有Store类型