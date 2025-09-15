/**
 * 外部使用store时，
 * 避免  const { token, userInfo } = useUserStore() 这种形式有性能隐患，导致不必要的重渲染
 * 
 * 推荐：
 * const x = useStore(state => state.x);
 * 
 * 外部使用示例：
 * import { useAppStore } from '@/store';
 * const token = useUserStore(s => s.token);
 * const userInfo = useUserStore(s => s.userInfo);
 * const setToken = useUserStore(s => s.setToken);
 * const setUserInfo = useUserStore(s => s.setUserInfo);
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventBus } from '@/utils/EventBus';
import { usePointsStore } from '@/store'

import { getGenerateMusicOSStatus, getCoverMusicStatus, saveCoverMusicOS, saveGenerateMusicOS } from '@/api/music/music';

// Store 类型定义
export interface APPState {
    audioDurationCache: Record<string, number>; // 音频时长缓存
    setAudioDurationCache: (url: string, duration: number) => void;
    getAudioDurationCache: (url: string) => number | undefined;

    appSign: string; // 应用标识
    setAppSign: (sign: string) => void;

    // 用来记录音乐生成任务id，方便在作品列表页显示状态
    coverTaskId: string;
    setCoverTaskId: (taskId: string) => void;

    taskIdType: string; // generate | cover
    setTaskIdType: (taskType: string) => void;

    // 轮询查询音乐生成任务的状态
    pollingGetStatusBycoverTaskId: () => void;
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
            },
            appSign: '',
            setAppSign: (sign) => set({ appSign: sign }),

            coverTaskId: '',
            setCoverTaskId: (taskId) => set({ coverTaskId: taskId }),

            taskIdType: '',
            setTaskIdType: (taskType) => set({ taskIdType: taskType }),

            pollingGetStatusBycoverTaskId: () => {
                const poll = async () => {
                    if (get().coverTaskId) {
                        const getStatusRequest = get().taskIdType === 'generate' ? getGenerateMusicOSStatus : getCoverMusicStatus
                        getStatusRequest({
                            task_id: get().coverTaskId
                        }).then((rsp) => {
                            let isSuccess = false;
                            if (get().taskIdType === "generate") {
                                isSuccess = rsp.status === 3;
                            } else if (get().taskIdType === "cover") {
                                isSuccess = rsp.status === 2;
                            }

                            if (isSuccess) { // 任务执行成功
                                console.log('store中轮询任务成功');
                                const saveRequest = get().taskIdType === 'generate' ? saveGenerateMusicOS : saveCoverMusicOS
                                saveRequest({
                                    task_id: get().coverTaskId
                                }).then((res) => {
                                    console.log('store中保存作品成功', res);
                                    set({ coverTaskId: '', taskIdType: '' })
                                    eventBus.emit('UPDATE_MY_WORKS', undefined)
                                    usePointsStore.getState().refreshPointsBalance()
                                }).catch((err) => {
                                    console.log('store中保存作品失败', err);
                                    set({ coverTaskId: '', taskIdType: '' })
                                    usePointsStore.getState().refreshPointsBalance()
                                })
                                
                            } else {
                                console.log('store中轮询翻唱任务状态');
                                setTimeout(poll, 5000);
                            }
                        }).catch((err) => {
                            setTimeout(poll, 5000);
                        })
                    }
                }
                poll()
            }
        }),
        // 持久化配置
        {
            name: 'app-storage', // 存储的key
            storage: createJSONStorage(() => AsyncStorage), // 设置持久化引擎为AsyncStorage
            // 指定要持久化的字段，不设置，默认持久化store中所有字段
            partialize: (state) => ({
                audioDurationCache: state.audioDurationCache,
                appSign: state.appSign,
                coverTaskId: state.coverTaskId,
                taskIdType: state.taskIdType,
            })
        }
    )
);
