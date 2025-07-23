import type { GenerateMusicParams, GenerateMusicResponse, RecommendGenresParams, RecommendGenresResponse, GetMusicWorkInfoParams ,ModifyMusicTitleParams, RegenerateMusicWorkParams, RegenerateMusicWorkResponse, DeleteMusicWorkParams, GetMusicTaskStatusParams, SingToMusicFileInfo, SaveMusicWorkParams, PolishLyricsParams, PolishLyricsResponse} from './types'
import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';

// 获取音乐作品列表
export function getMusicWorks() {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_WORKS);
}

// 生成音乐
export function generateMusic(params: GenerateMusicParams) {
  const formData = new FormData();
  formData.append('work_lyrics', params.work_lyrics);
  params.work_genres.forEach((genre: string) => {
    formData.append('work_genres', genre);
  });
  return http.post<GenerateMusicResponse>(
    API_ENDPOINTS.MUSIC.GENERATE_MUSIC,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );            
}

// 推荐曲风
export function recommendGenres(params: RecommendGenresParams) {
  return http.post<RecommendGenresResponse>(
    API_ENDPOINTS.MUSIC.RECOMMEND_GENRES,
    params
  );
}

// 获取音乐作品信息
export function getMusicWorkInfo(params: GetMusicWorkInfoParams) {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_WORK_INFO, { params });
}

// 重命名音乐
export function modifyMusicTitle(params: ModifyMusicTitleParams) {
  return http.post<any>(API_ENDPOINTS.MUSIC.MODIFY_MUSIC_TITLE, params);
}

// 重制音乐作品
export function regenerateMusicWork(params: RegenerateMusicWorkParams) {
  return http.post<RegenerateMusicWorkResponse>(API_ENDPOINTS.MUSIC.REGENERATE_MUSIC_WORK, params);
}

// 删除音乐作品
export function deleteMusicWork(params: DeleteMusicWorkParams) {
  return http.post<any>(API_ENDPOINTS.MUSIC.DELETE_MUSIC_WORK, params);
}

// 查询任务状态
export function getMusicTaskStatus(params: GetMusicTaskStatusParams) {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_TASK_STATUS, { params });
}

// 哼唱成曲
export function singToMusic(audioFile: SingToMusicFileInfo) {
  const formData = new FormData();
  console.log('audioFile', audioFile);
  formData.append('audio_file', {
    uri: audioFile.uri,
    name: audioFile.name,
    type: audioFile.type,
  });
  return http.post<any>(
    API_ENDPOINTS.MUSIC.SING_TO_MUSIC,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 保存音乐作品
export function saveMusicWork(params: SaveMusicWorkParams) {
  const formData = new FormData();
  if (params.task_id) {
    formData.append('task_id', params.task_id);
  }
  formData.append('music_index_list', JSON.stringify(params.music_index_list));
  return http.post<any>(
    API_ENDPOINTS.MUSIC.SAVE_MUSIC_WORK,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 歌词润饰
export function polishLyrics(params: PolishLyricsParams) {
  const formData = new FormData();
  formData.append('work_lyrics', params.work_lyrics);
  return http.post<PolishLyricsResponse>(
    API_ENDPOINTS.MUSIC.POLISH_LYRICS,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}