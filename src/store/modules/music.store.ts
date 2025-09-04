
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
    musicCoverFileString: string;
    setMusicCoverFileString: (fileString:string) => void;
    generateMusicType: 'cover' | 'generate';
    setGenerateMusicType: (type: 'cover' | 'generate') => void;
    coverMusicFile: any;
    setCoverMusicFile: (file: any) => void;
    isSelectedVoice: boolean;
    setIsSelectedVoice: (isSelected: boolean) => void;
    taskId: string;
    setTaskId: (taskId: string) => void;
}

export const useMusicStore = create<MusicState>()(
        (set) => ({
            musicGenerateInfo: {title: '', lyrics: '', musicStyles: []},
            setMusicGenerateInfo: (info) => set({musicGenerateInfo: info}),
            musicCoverFileString: '',
            setMusicCoverFileString: (fileString:string) => set({musicCoverFileString: fileString}),
            generateMusicType: 'generate',
            setGenerateMusicType: (type: 'cover' | 'generate') => set({generateMusicType: type}),
            coverMusicFile: null,
            setCoverMusicFile: (file: any) => set({coverMusicFile: file}),
            isSelectedVoice: false,
            setIsSelectedVoice: (isSelected: boolean) => set({isSelectedVoice: isSelected}),
            taskId: '',
            setTaskId: (taskId: string) => set({taskId: taskId}),
        })
);
