/**
 * 外部使用store时，
 * 避免  const { token, userInfo } = useUserStore() 这种形式有性能隐患，导致不必要的重渲染
 * 
 * 推荐：
 * const x = useStore(state => state.x);
 * 
 * 外部使用示例：
 * import { useUserStore } from '../../store';
 * const token = useUserStore(s => s.token);
 * const userInfo = useUserStore(s => s.userInfo);
 * const setToken = useUserStore(s => s.setToken);
 * const setUserInfo = useUserStore(s => s.setUserInfo);
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store 类型定义
export interface APPState {
    audioDurationCache: Record<string, number>; // 音频时长缓存
    setAudioDurationCache: (url: string, duration: number) => void;
    getAudioDurationCache: (url: string) => number | undefined;
}

export const useAppStore = create<APPState>()(
    persist(
        (set, get) => ({
            audioDurationCache: {},
            setAudioDurationCache: (url, duration) =>
                set((state) => ({
                    audioDurationCache: {
                        ...state.audioDurationCache,
                        [url]: duration,
                    },
                })),
            getAudioDurationCache: (url) => {
                return get().audioDurationCache[url]
            }
        }),
        // 持久化配置
        {
            name: 'audio-storage', // 存储的key
            storage: createJSONStorage(() => AsyncStorage), // 设置持久化引擎为AsyncStorage
            // 指定要持久化的字段，不设置，默认持久化store中所有字段
            partialize: (state) => ({
                audioDurationCache: state.audioDurationCache,
            })
        }
    )
);
