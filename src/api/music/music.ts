import type { GenerateMusicParams, GenerateMusicResponse, RecommendGenresParams, RecommendGenresResponse, GetMusicWorkInfoParams ,ModifyMusicTitleParams, RegenerateMusicWorkParams, RegenerateMusicWorkResponse, DeleteMusicWorkParams, GetMusicTaskStatusParams, SingToMusicFileInfo, SaveMusicWorkParams, PolishLyricsParams, PolishLyricsResponse} from './types'
import http from '../../utils/http'
import { API_ENDPOINTS } from '../apiPath';

// 获取音乐作品列表
export function getMusicWorks() {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_WORKS);
}

// 生成音乐
export function generateMusic(params: GenerateMusicParams) { 
  return http.post<GenerateMusicResponse>(
    API_ENDPOINTS.MUSIC.GENERATE_MUSIC,
    params,
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
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_WORK_INFO+'?work_id='+params.work_id, {params});
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
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_TASK_STATUS, params);
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
  return http.post<PolishLyricsResponse>(
    API_ENDPOINTS.MUSIC.POLISH_LYRICS,
    params,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 翻唱歌曲
export function coverMusic(params: { voice_print_id?: string; music_url?: any }) {
  return http.post<any>(
    API_ENDPOINTS.MUSIC.COVER_MUSIC,
    params,
  );
}

// 获取翻唱歌曲状态
export function getCoverMusicStatus(params?: { task_id?: string }) {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_COVER_MUSIC_STATUS, params);
}

// 生成歌曲
export function generateMusicOS(params: { 
  lyrics: string; 
  genres: string[]; 
  work_title?: string | null; 
  voice_print_id?: number 
}) {
  const formData = new FormData();
  formData.append('lyrics', params.lyrics);
  formData.append('genres', JSON.stringify(params.genres));
  formData.append('work_title', params.work_title);
  formData.append('voice_print_id', params.voice_print_id?.toString() || '');
  return http.post<any>(API_ENDPOINTS.MUSIC.GENERATE_MUSIC_OS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 保存翻唱歌曲
export function saveCoverMusicOS(params: { task_id: string }) {
  const formData = new FormData();
  formData.append('task_id', params.task_id);
  return http.post<any>(API_ENDPOINTS.MUSIC.SAVE_COVER_MUSIC_OS, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

// 获取生成歌曲状态
export function getGenerateMusicOSStatus(params?: { task_id?: string }) {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_GENERATE_MUSIC_OS_STATUS, params);
}

// 保存生成歌曲
export function saveGenerateMusicOS(params: { task_id: string }) {
  return http.post<any>(API_ENDPOINTS.MUSIC.SAVE_GENERATE_MUSIC_OS, params, );
}

// 获取个人作品
export function getPersonalWorks(params: { page_num: number, page_size: number,title:string}) {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_PERSONAL_WORKS, params);
}

// 获取支持语言
export function getSupportedLanguages() {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_SUPPORTED_LANGUAGES);
}

//获取音乐风格
export function getMusicSegmentation() {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_MUSIC_SEGMENTATION);
}

// 删除音乐
export function deleteMusic(params: { id_list: Array<number> }) {
  return http.post<any>(API_ENDPOINTS.MUSIC.DELETE_MUSIC, params);
}

//歌曲重命名
export function renameMusic(params: { id: number, name: string }) {
  return http.post<any>(API_ENDPOINTS.MUSIC.RENAME_MUSIC, params);
}

// 获取分享链接
export function getShareLink(params: { id: number }) {
  return http.get<any>(API_ENDPOINTS.MUSIC.GET_SHARE_LINK, params);
}

// 上传歌曲文件
export function uploadAudioFile(audioFile: SingToMusicFileInfo) {
  const formData = new FormData();
  console.log('audioFile', audioFile);
  formData.append('files', {
    uri: audioFile.uri,
    name: audioFile.name,
    type: audioFile.type,
  });
  return http.post<any>(
    API_ENDPOINTS.FILE.UPLOAD_FILE,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

//保存歌曲到我的作品列表
export function saveMusicByLink(params: { title: string, file_url: string }) {
  return http.post<any>(API_ENDPOINTS.MUSIC.SAVE_MUSIC_FILE, params);
}
