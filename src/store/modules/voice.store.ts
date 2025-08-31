
import { create } from 'zustand';


// 用户信息类型
interface VoiceFile {
 uri: string;
 name: string;
 type: string;
}

export enum VoiceType {
    CREATE = 'create',
    OPTIMIZE = 'optimize',
}

// Store 类型定义
export interface VoiceState {
    recordVoiceFile: VoiceFile;
    setVoiceFile: (voiceFile: VoiceFile) => void;
    local: string | null;
    setLocal: (lang: string) => void;
    type: VoiceType;
    setType: (type: VoiceType) => void;
    materials: VoiceFile[];
    setMaterials: (materials: VoiceFile[]) => void;
}

export const useVoiceStore = create<VoiceState>()(
        (set) => ({
            recordVoiceFile: {uri: '', name: '', type: ''},
            setVoiceFile: (voiceFile) => set({recordVoiceFile: voiceFile}),
            local: null,
            setLocal: (lang) => set({local: lang}),
            type: VoiceType.CREATE,
            setType: (type) => set({type: type}),
            materials: [],
            setMaterials: (materials) => set({materials: materials}),
        })
);
