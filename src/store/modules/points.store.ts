import { create } from 'zustand';


// 用户信息类型
interface PointsInfo {
    total_points: number;
}


// Store 类型定义
export interface PointsState {
    pointsBalance: number;
    pointsHistory: PointsInfo[];
    setPointsBalance: (balance: number) => void;
    setPointsHistory: (history: PointsInfo[]) => void;
    refreshPointsBalance: () => void;
    consumePoints: (points: number) => void;
    getPoints: () => void;
}

export const usePointsStore = create<PointsState>()(
        (set) => ({
            pointsBalance: 0,
            pointsHistory: [],                                                                                                        
            setPointsBalance: (balance) => set({pointsBalance: balance}),
            setPointsHistory: (history) => set({pointsHistory: history}),
            // 刷新积分余额
            refreshPointsBalance: async () => {
                // try {
                //     set({ isLoading: true });
                //     const response = await getPointsBalance();
                //     if (response.code === 200) {
                //         set({ 
                //             pointsBalance: response.data.balance,
                //             lastUpdated: Date.now()
                //         });
                //     }
                // } catch (error) {
                //     console.error('获取积分余额失败:', error);
                // } finally {
                //     set({ isLoading: false });
                // }
            },
            // 消费积分
            consumePoints: async (points: number) => {
                // try {
                //     set({ isLoading: true });
                //     const response = await consumePoints(points);
                // }
            },
            // 获取积分
            getPoints: async () => {
                // try {
                //     set({ isLoading: true });
                //     const response = await getPoints();
                // }
            },

        })
);
