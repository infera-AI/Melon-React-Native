// 说话按钮组件
/**
 * 使用示例
import SpeakBtn, { SpeakBtnRef } from './SpeakBtn';
const speakBtnRef = useRef<SpeakBtnRef>(null);
<SpeakBtn
  ref={speakBtnRef}
  beforeLanguage="zh"
  afterLanguage="en"
  renderContent={() => <View><Text>🎤 说话</Text></View>}
/>

speakBtnRef.current?.destroy();




 */
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef
} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Platform,
  PermissionsAndroid,
  Dimensions
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { WebSocketWrapper, WSStatus } from '@/utils/WebSocketWrapper';
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';
import { useAppStore, useUserStore } from '@/store';
import { scaleSize } from '@/utils/scale';
import { Portal } from 'react-native-paper';
import VoiceWave from '@/components/VoiceWave';
import { NativeModules } from 'react-native';
const { AudioSessionManager } = NativeModules;
import { AudioPlayerController } from '@/utils/AudioPlayerController';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { APP_SIGN_ENUM } from '@/utils';

export type SpeakBtnRef = {
  destroy: () => void;
  start: () => void;
  stop: () => void;
};

type Props = {
  beforeLanguage?: string; // 主语言
  afterLanguage?: string; // 翻译成什么语言
  disabled?: boolean,
  hidden?: boolean, // 是否不渲染页面元素
  mode?: string, // listening (长连接，以及不断返回识别结果的)    | chat（对话模式）
  voiceWaveBgColor?: string,
  onlyRecognition?: boolean, // 是否仅仅识别语音， 不做翻译（用在口语练习中），所以也不用传beforeLanguage和afterLanguage，
  // backgroundColor?: string;
  // spinnerSize?: 'small' | 'large';
  renderContent?: () => JSX.Element;
  tellResult?: (data: any) => void;
  statusChange?: (status: StatusEnum) => void;
  isDownCallBack?: (isDownStatus: boolean) => void;
  // timeout?: number;
  // beforeSelectBack?: (code: Language) => void; // 主语言选择回调
  // afterSelectBack?: (code: Language) => void; // 目标语言选择回调
  // progress?: number;
};

const { width, height } = Dimensions.get('window');

export enum StatusEnum {
  TYPE_NORMAL = 'TYPE_NORMAL',  // 未按下按钮
  TYPE_INIT = 'TYPE_INIT', // 麦克风及socket服务加载中
  TYPE_OPEN = 'TYPE_OPEN', // socket open成功
  TYPE_WAIT_TRANSLATION_RESULT = 'TYPE_WAIT_TRANSLATION_RESULT', //  等待翻译结果
  TYPE_TRANSLATION_OVER = 'TYPE_TRANSLATION_OVER', // 翻译结束
  TYPE_WAIT_ANSWER = 'TYPE_WAIT_ANSWER', // 用识别结果传给接口等待回答（该类型是在外部调用方使用的）
  // TYPE_ANSWER_ERROR = 'TYPE_ANSWER_ERROR', // 等待答复，响应失败（该类型是在外部调用方使用的）
  TYPE_PLAY_ANSWER_AUDIO = 'TYPE_PLAY_ANSWER_AUDIO', // 播放回答的音频 （该类型是在外部调用方使用的）
} 

let ws: any = null

let isSendedAudioData = false // 是否发送过音频数据  （防止没发送音频数据就抬起）

const SpeakBtn = forwardRef<SpeakBtnRef, Props>(({
  beforeLanguage = 'en',
  afterLanguage = 'en',
  voiceWaveBgColor = '#262626',
  onlyRecognition = false,
  hidden = false,
  mode = 'chat',
  renderContent = () => <View/>,
  tellResult = () => null,
  statusChange = () => null,
  isDownCallBack = () => null,
  disabled = false
  // beforeSelectBack = null,
  // afterSelectBack = null
}, ref) => {

  const { t } = useLanguage()
  const { show } = useMessageModal();
  const token = useUserStore(s => s.token);

  const [socketStatus, setSocketStatus] = useState(WSStatus.CLOSED)
  const socketStatusRef = useRef(WSStatus.CLOSED)

  const [voiceStatus, setVoiceStatus] = useState(StatusEnum.TYPE_NORMAL) // 整个语音识别流程的状态，主要回调给组件使用方

  const [isDown, setIsDown] = useState(false)

  const [pcmData, setPcmData] = useState<string>('');

  useEffect(() => {
    isDownCallBack(isDown)
  }, [isDown])

  const openMic = async () => {
    console.log('openMic1111-------', beforeLanguage);
    console.log('openMic22222-------', afterLanguage);
    
    // if (Platform.OS === 'android') {
    //   let hasPermission = await checkMicrophone();
    //   if (!hasPermission) {
    //     console.log('无权限');
    //     hasPermission = await requestMicrophonePermission();
    //   }
    //   if (!hasPermission) {
    //     console.warn('录音权限未授权');
    //     show({
    //       message: '录音权限未授权, 请重试'
    //     })
    //     return;
    //   }
    // }
    setVoiceStatus(StatusEnum.TYPE_INIT)
    socketStatusRef.current = WSStatus.INIT
    setSocketStatus(WSStatus.INIT)

    let appSign = useAppStore.getState().appSign
    let wsHost
    if (__DEV__) {
      wsHost = 'ws://218.244.147.232:80'
      // wsHost = 'wss://api.sinobiz.biz' // 海外线上url
    } else if (
        appSign === APP_SIGN_ENUM.TYPE_MELON ||
        appSign === APP_SIGN_ENUM.TYPE_MOMOR
    ) {
        wsHost = 'wss://api.sinobiz.biz' // 国内线上url
        
    } else if (
        appSign === APP_SIGN_ENUM.TYPE_MELONS ||
        appSign === APP_SIGN_ENUM.TYPE_MOMORS
    ) {
        wsHost = 'wss://api.sinobiz.biz' // 海外线上url
    }


    let wsUri
    if (onlyRecognition) {
      wsUri = `${wsHost}/ws/assistant/send_audio_message?token=${token}`
    } else {
      wsUri = `${wsHost}/ws/conversations/send_audio_message?token=${token}`
    }
    ws && ws.close()
    ws = null
    ws = new WebSocketWrapper({
      url: wsUri,
      // 连接成功回调
      onOpen: () => {
        console.log('连接成功----');
        if (socketStatusRef.current === WSStatus.CLOSED) {
          setVoiceStatus(StatusEnum.TYPE_NORMAL)
          destroy()
          return
        }
        let param
        if (onlyRecognition) {
          param = {
            "format": 'PCM',
            "sample_rate": 16000,
          }
        } else {
          param = {
            "mode": mode,
            "format": 'PCM',
            "sample_rate": 16000,
            "source_language": beforeLanguage,
            "target_language": afterLanguage
          }
        }
        console.log('发送首条消息-----', param);
        
        ws.send(param);
        setVoiceStatus(StatusEnum.TYPE_OPEN)
        setSocketStatus(WSStatus.OPEN)
        socketStatusRef.current = WSStatus.OPEN
        
      },
      // 收到消息回调
      onMessage: (data) => {
        console.log('speakbtn收到消息:', data);
        if (data.hasOwnProperty('status') && (data.hasOwnProperty('error_msg') || data.hasOwnProperty('translated_text'))) { // status 和 error_msg存在时，才是服务端给我发的消息
          if (mode === 'listening' && data?.status === 'processing') {
            tellResult(data)
            return
          } else if (data?.status === 'success') {
            if (data?.error_msg) {
              show({
                message: data?.error_msg
              })
              setVoiceStatus(StatusEnum.TYPE_NORMAL)
            } else if (data?.source_text) {
              tellResult(data)
              setVoiceStatus(StatusEnum.TYPE_TRANSLATION_OVER)
            } else {
              show({
                message: t('translate_screen.mic_result_error')
              })
              setVoiceStatus(StatusEnum.TYPE_NORMAL)
            }
            
          } else {
            setVoiceStatus(StatusEnum.TYPE_NORMAL)
            show({
              message: data?.error_msg || t('translate_screen.mic_result_error')
            })
          }
          destroy()
        } else if (data?.status === 'error') {
          setVoiceStatus(StatusEnum.TYPE_NORMAL)
          destroy()
        }

        // 你可以根据需要解析消息，比如 JSON.parse(event.data)
      },
      // 连接关闭回调
      onClose: (event) => {
        console.log(`连接关闭，code=${event.code}，reason=${event.reason}`);
        setSocketStatus(WSStatus.CLOSED)
        socketStatusRef.current = WSStatus.CLOSED
      },
      // 连接错误回调
      onError: (event) => {
        console.error('WebSocket 出错:', event.message);
      },
      // 状态变化回调
      onStatusChange: (status) => {
        console.log('WebSocket 状态改变:', status);
        

      },
    })
    ws.connect();

    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 1, 
      wavFile: 'test.wav', 
    };
    AudioRecord.init(options);

    let audioBuffer: Uint8Array[] = [];
    const CHUNK_SIZE = 3200; // 阿里云推荐每次发送1280字节
    AudioRecord.on('data', (data: string) => {
      setPcmData(data);
      if (socketStatusRef.current === WSStatus.OPEN) {
        
        // data 是 base64 编码的 PCM 数据
        const rawData = Buffer.from(data, 'base64');

        // 将数据压入缓存池
        audioBuffer.push(rawData);

        // 统计当前缓存池字节数
        const totalLength = audioBuffer.reduce((acc, cur) => acc + cur.length, 0);

        if (totalLength >= CHUNK_SIZE) {
          
          // 合并为一块 buffer
          const chunk = Buffer.concat(audioBuffer);
          const sendBuffer = chunk.slice(0, CHUNK_SIZE);

          // console.log('发送的音频数据------', sendBuffer);
          
          // 发送音频数据
          ws && ws.send(sendBuffer)
          isSendedAudioData = true

          // 剩余数据保留
          const remaining = chunk.slice(CHUNK_SIZE);
          audioBuffer = [remaining];
        }
      }
    });
    AudioRecord.start();

  }

  // const checkMicrophone = async () => {
  //   const result = await PermissionsAndroid.check(
  //     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  //   );
  //   return result;
  // };

  // const requestMicrophonePermission = async () => {
  //   const granted = await PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //     {
  //       title: t('translate_screen.permission_title'),
  //       message: t('translate_screen.permission_desc'),
  //       buttonPositive: t('translate_screen.permission_confirm'),
  //       buttonNegative: t('translate_screen.document_cancel'),
  //     }
  //   );
  //   return granted === PermissionsAndroid.RESULTS.GRANTED;
  // };

  const stopMic = () => {
    try {
      AudioRecord.stop();
      // setAudioCategory('playback')
      if (ws && isSendedAudioData) {
        ws && ws.send({finish: true})
      } else {
        console.log('socket--ws不存在 或 没有发送过音频');
        setVoiceStatus(StatusEnum.TYPE_NORMAL)
        destroy()
      }
      
    } catch (error) {
      
    }
  }

  const destroy = () => {
    ws && ws.close()
    try {
      AudioRecord.stop();
      // setAudioCategory('playback')
    } catch (error) {
      
    }
  }

  const downClick = async () => {
    console.log('按下');
    isSendedAudioData = false
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      // 权限已通过，开始录音
      console.log('权限已通过');
      AudioPlayerController.getInstance().release()
      setIsDown(true)
      openMic()
      return;
    }

    if (result === RESULTS.DENIED) {
      const newResult = await request(permission);

      if (newResult === RESULTS.GRANTED) {
        // 首次获取权限成功
        console.log('获得麦克风权限');
        
      } else {
        console.log('未授权麦克风');
        show({
          message: t('translate_screen.mic_permission_error')
        })
      }
      return;
    }

    if (result === RESULTS.BLOCKED) {
      show({
        message: t('translate_screen.mic_permission_error')
      })
      return;
    }

    
  }

  const upClick = async () => {
    console.log('抬起');
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const result = await check(permission);
    if (result !== RESULTS.GRANTED) { // 未授权时
      return
    }
    // console.log('11112222----', isSendedAudioData);
    
    socketStatusRef.current = WSStatus.CLOSED
    if (!isSendedAudioData) {
      setVoiceStatus(StatusEnum.TYPE_NORMAL)
    } else {
      setVoiceStatus(StatusEnum.TYPE_WAIT_TRANSLATION_RESULT)
    }
    stopMic()
    setIsDown(false)
    setPcmData('');
  }

  async function setAudioCategory(category: string) {
    if (Platform.OS === 'ios') {
      try {
        await AudioSessionManager.setAudioSessionCategory(category);
        console.log('Audio session category set:', category);
      } catch (e) {
        console.error('Failed to set audio session category:', e);
      }
    }
  }

  useEffect(() => {
    statusChange(voiceStatus)
  }, [voiceStatus])

  useEffect(() => {
    return () => {
      try {
        AudioRecord.stop();
        // setAudioCategory('playback')
      } catch (error) {
        
      }
      ws && ws.close()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 💡暴露方法
  useImperativeHandle(ref, () => ({
    destroy,
    start: downClick,
    stop: upClick
  }));

  if (hidden) {
    return null
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        // onPress={() => openMic()}
        onPressIn={downClick}
        onPressOut={upClick}
        style={disabled && styles.disabledBtn}
      >
        {renderContent && renderContent()}
      </TouchableOpacity>
      {
        socketStatus === WSStatus.OPEN && isDown &&
        <Portal>
          <View style={[styles.voiceView, {backgroundColor: voiceWaveBgColor}]}>
            <VoiceWave
              pcmData={pcmData}
              barCount={15}
              barColor="#00c06d"
              barMinHeight={10}
              barMaxHeight={80}
            />
          </View>
        </Portal>
        
      }
    </>
  );
});

const styles = StyleSheet.create({
  // maskView: {
  //   width: width,
  //   height: height,
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   zIndex: 9999,
  //   backgroundColor: 'blue',
  //   pointerEvents: 'none'
  // },
  voiceView: {
    position: 'absolute',
    width: scaleSize(160),
    height: scaleSize(80),
    borderRadius: scaleSize(10),
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: '-50%' }, // 宽度的一半
      { translateY: '-50%' }, // 高度的一半
    ],
  },
  disabledBtn: {
    pointerEvents: 'none',
    opacity: 0.3,
  },
});

export default SpeakBtn;
