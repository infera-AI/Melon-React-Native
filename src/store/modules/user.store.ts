/**
 * 外部使用store时，
 * 避免  const { token, userInfo } = useUserStore() 这种形式有性能隐患，导致不必要的重渲染
 * 
 * 推荐：
 * const x = useStore(state => state.x);
 * 
 * 外部使用示例：
 * import { useUserStore } from '@/store';
 * const token = useUserStore(s => s.token);
 * const userInfo = useUserStore(s => s.userInfo);
 * const setToken = useUserStore(s => s.setToken);
 * const setUserInfo = useUserStore(s => s.setUserInfo);
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 用户信息类型
interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

// Store 类型定义
export interface UserState {
    userInfo: UserInfo | null;
    setUserInfo: (user: UserInfo) => void;
    updateUserInfo: (info: Partial<UserInfo>) => void; // 只允许更新UserInfo中部分字段

    token: string | null;
    setToken: (token: string) => void;

    setLoginInfo: (user: UserInfo, token: string) => void; // 设置登录后用户信息以及token
    clearLoginInfo: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            userInfo: null,
            setUserInfo: (userInfo) => set({userInfo}),
            updateUserInfo: (info) => {
                set((state) => ({
                    userInfo: state.userInfo ? {...state.userInfo, ...info} : null
                }))
            },

            token: null,
            setToken: (token) => set({token}),

            setLoginInfo: (userInfo, token) => set({ userInfo, token }),
            clearLoginInfo: () => set({ userInfo: null, token: null }),
        }),
        // 持久化配置
        {
            name: 'user-storage', // 存储的key
            storage: createJSONStorage(() => AsyncStorage), // 设置持久化引擎为AsyncStorage
            // 指定要持久化的字段，不设置，默认持久化store中所有字段
            partialize: (state) => ({
                userInfo: state.userInfo,
                token: state.token,
            })
        }
    )
);
