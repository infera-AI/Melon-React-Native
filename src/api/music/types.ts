export interface ApifoxModel<T = any> {
  code: number;
  data: T;
  message: string;
  [property: string]: any;
}

// 歌曲生成请求参数
export interface GenerateMusicParams {
  work_title: string;
  work_genres: string[];
  work_lyrics: string;
  [property: string]: any;
}

// 歌曲生成返回数据
export interface GenerateMusicResponse {
  task_id: string;
  [property: string]: any;
}

// 推荐曲风接口请求参数
export interface RecommendGenresParams {
  work_lyrics: string;
  [property: string]: any;
}

// 推荐曲风接口返回数据
export interface RecommendGenresData {
  work_genres: string[];
  [property: string]: any;
}

export interface RecommendGenresResponse extends ApifoxModel {
  data: RecommendGenresData;
}   

export interface GetMusicWorkInfoParams {
  work_id: string;
  [property: string]: any;
}

export interface ModifyMusicTitleParams {
  work_id: string;
  work_title: string;
  [property: string]: any;
}

export interface RegenerateMusicWorkParams {
  work_genres?: string[];
  work_id?: string;
  work_lyrics?: string;
  [property: string]: any;
}

export interface RegenerateMusicWorkResponse extends ApifoxModel {
  data: {
    task_id: string;
    [property: string]: any;
  };
}

export interface DeleteMusicWorkParams {
  work_ids: number[];
  [property: string]: any;
}

export interface DeleteMusicWorkResponse extends ApifoxModel {
  data: null;
}

export interface GetMusicTaskStatusParams {
  task_id: string;
  [property: string]: any;
}

export interface SingToMusicFileInfo {
  name: string;
  type: string;
  uri: string;
}

export interface SaveMusicWorkParams {
  task_id?: string;
  music_index_list: string[];
  [property: string]: any;
}

export interface PolishLyricsParams {
  work_lyrics: string;
  [property: string]: any;
}

export interface PolishLyricsResponse extends ApifoxModel {
  data: {
    work_lyrics: string;
    [property: string]: any;
  };
}
