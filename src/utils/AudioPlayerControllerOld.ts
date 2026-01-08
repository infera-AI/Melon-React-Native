/**
 * 示例
 * import { AudioPlayerController } from '@/utils/AudioPlayerController';
 */
// react-native-track-player 待支持新架构后再用
// import TrackPlayer, {
//   Capability,
//   Event,
//   State,
//   Track,
// } from 'react-native-track-player';
// import { useAppStore } from '@/store';

// type Callbacks = {
//   onInit?: (info: { duration: string; controller: AudioPlayerController }) => void;
//   onPlay?: () => void;
//   onPause?: () => void;
//   onStop?: () => void;
//   onProgress?: (data: { position: string; percent: number }) => void;
//   onEnd?: () => void;
//   onError?: (error: Error) => void;
// };

// function formatTime(seconds: number): string {
//   if (seconds <= 0 || isNaN(seconds)) return '0:00';

//   const hrs = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);

//   if (hrs > 0) {
//     return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
//       .toString()
//       .padStart(2, '0')}`;
//   }
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// }

// export class AudioPlayerController {
//   private static _instance: AudioPlayerController | null = null;
//   private _url: string = '';
//   private _callbacks: Callbacks = {};
//   private _isPlayerSetup = false;
//   private _progressTimer?: ReturnType<typeof setInterval>;
//   private _durationPollTimer?: ReturnType<typeof setInterval>;
//   private _currentPlaybackState: State = State.None; // 记录当前播放状态

//   private constructor() {
//     this._bindEvents();
//   }

//   // 获取单例实例
//   public static getInstance() {
//     if (!this._instance) {
//       this._instance = new AudioPlayerController();
//     }
//     return this._instance;
//   }

//   // 销毁单例
//   public static async destroyInstance() {
//     if (this._instance) {
//       await this._instance.destroy();
//       this._instance = null;
//     }
//   }

//   async init(url: string, callbacks?: Callbacks) {
//     if (!url) return;

//     if (callbacks) this._callbacks = callbacks;

//     try {
//       if (!this._isPlayerSetup) {
//         await TrackPlayer.setupPlayer();
//         await TrackPlayer.updateOptions({
//           capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
//           compactCapabilities: [Capability.Play, Capability.Pause],
//         });
//         this._isPlayerSetup = true;
//       }
//       // 如果是同一个url，seek到头并播放，触发回调，返回，不重新初始化
//       if (this._url === url) {
//         // const track: Track = {
//         //     id: 'track_' + Date.now(),
//         //     url: this._url,
//         //     title: '音频',
//         //     artist: '未知',
//         // };
//         // await TrackPlayer.add(track);
//         // console.log('TrackPlayer.getQueue---', TrackPlayer.getQueue());
        
//         // await TrackPlayer.seekTo(0);

//         // this._callbacks.onInit?.({
//         //   duration: formatTime(await TrackPlayer.getDuration()),
//         //   controller: this,
//         // });
//         this._startProgressTimer();
//         await this.play();
//         return;
//       }

//       // 新url，先停止并重置旧资源
//       if (this._url) {
//         await TrackPlayer.stop();
//         await TrackPlayer.reset();
//       }

//       this._url = url;

//       const track: Track = {
//         id: 'track_' + Date.now(),
//         url: this._url,
//         title: '音频',
//         artist: '未知',
//       };
//       await TrackPlayer.add(track);

//       const durationSec = await this._pollDuration();

//       if (durationSec <= 0) {
//         throw new Error('获取音频时长失败');
//       }

//       const formattedDuration = formatTime(durationSec);
//       this._callbacks.onInit?.({ duration: formattedDuration, controller: this });

//       this._startProgressTimer();
//     } catch (error) {
//       this._callbacks.onError?.(error as Error);
//     }
//   }

//   private _pollDuration(): Promise<number> {
//     return new Promise((resolve) => {
//       // 读取缓存中音频时长
//       const cacheDuration = useAppStore.getState().getAudioDurationCache(this._url);
//       console.log('缓存值cacheDuration---', cacheDuration);
      
//       if (cacheDuration) {
//         console.log('缓存中已存在直接返回');
//         resolve(cacheDuration);
//       } else {
//         let elapsed = 0;
//         const intervalMs = 200;
//         const maxDurationMs = 300000;

//         this._durationPollTimer = setInterval(async () => {
//             elapsed += intervalMs;
//             const duration = await TrackPlayer.getDuration();
//             console.log('循环获取duration----', duration);
            
//             if (duration > 0) {
//                 clearInterval(this._durationPollTimer);
//                 this._durationPollTimer = undefined;
//                 console.log('设置新的音频链接+时长到缓存');
//                 useAppStore.getState().setAudioDurationCache(this._url, duration)
//                 resolve(duration);
//             } else if (elapsed >= maxDurationMs) {
//                 clearInterval(this._durationPollTimer);
//                 this._durationPollTimer = undefined;
//                 resolve(0);
//             }
//         }, intervalMs);
//       }
//     });
//   }

//   async play() {
//     await TrackPlayer.play();
//     this._currentPlaybackState = State.Playing;
//     this._callbacks.onPlay?.();
//   }

//   async pause() {
//     await TrackPlayer.pause();
//     this._currentPlaybackState = State.Paused;
//     this._callbacks.onPause?.();
//   }

//   async stop() {
//     console.log('[AudioPlayerController] stop called');
//     await TrackPlayer.pause();
//     await TrackPlayer.seekTo(0);
//     clearInterval(this._progressTimer);
//     this._currentPlaybackState = State.Stopped;
//     this._callbacks.onStop?.();
//   }

//   async destroy() {
//     clearInterval(this._progressTimer);
//     this._progressTimer = undefined;
//     clearInterval(this._durationPollTimer);
//     this._durationPollTimer = undefined;
//     await TrackPlayer.reset();
//     // this._isPlayerSetup = false;
//     this._url = '';
//     this._currentPlaybackState = State.None;
//     this._callbacks = {};
//   }

//   private _startProgressTimer() {
//     if (this._progressTimer) {
//       clearInterval(this._progressTimer);
//     }

//     this._progressTimer = setInterval(async () => {
//       try {
//         if (this._currentPlaybackState === State.Playing) {
//           const positionSec = await TrackPlayer.getPosition();
//           const durationSec = await TrackPlayer.getDuration();
//           const percent = durationSec > 0 ? Math.floor((positionSec / durationSec) * 100) : 0;
//           const positionStr = formatTime(positionSec);

//           this._callbacks.onProgress?.({
//             position: positionStr,
//             percent,
//           });
//         }
//       } catch {
//         // 忽略异常
//       }
//     }, 500);
//   }

//   private _bindEvents() {
//     TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
//       this._currentPlaybackState = event.state;

//       if (event.state === State.Playing) {
//         this._callbacks.onPlay?.();
//       } else if (
//         event.state === State.Paused ||
//         event.state === State.Stopped ||
//         event.state === State.Ready
//       ) {
//         this._callbacks.onPause?.();
//       }
//     });

//     TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
//       this._callbacks.onEnd?.();
//     });
//   }
// }
