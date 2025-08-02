
import { create } from 'zustand';


// 用户信息类型
interface MusicGenerateInfo {
    title: string;
    lyrics: string;
    musicStyles: string[];
}


// Store 类型定义
export interface MusicState {
    musicGenerateInfo: MusicGenerateInfo;
    setMusicGenerateInfo: (info: MusicGenerateInfo) => void;
}

export const useMusicStore = create<MusicState>()(
        (set) => ({
            musicGenerateInfo: {title: '', lyrics: '', musicStyles: []},
            setMusicGenerateInfo: (info) => set({musicGenerateInfo: info}),
        })
);
