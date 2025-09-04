import { create } from 'zustand';
import { getPointsBalance } from '@/api/profile/profile';


// 用户信息类型
interface PointsInfo {
    total_points: number;
}


// Store 类型定义
export interface PointsState {
    pointsBalance: number;
    setPointsBalance: (balance: number) => void;
    refreshPointsBalance: () => void;
}

export const usePointsStore = create<PointsState>()(
        (set) => ({
            pointsBalance: 0,
            setPointsBalance: (balance) => set({pointsBalance: balance}),
            // 刷新积分余额
            refreshPointsBalance: async () => {
                try {
                    const response = await getPointsBalance();
                    if (response.code === 200) {
                        set({ 
                            pointsBalance: response.value,
                        });
                    }
                } catch (error) {
                    console.error('获取积分余额失败:', error);
                } finally {
                }
            }
        })
);
