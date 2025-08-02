// 聆听模式页面
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  TextInput,
  Keyboard,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import EStyleSheet from 'react-native-extended-stylesheet';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { KeyboardEvent as RNKeyboardEvent } from 'react-native';
import LangSelectCard from '@/components/LangSelectCard'
import type { Language } from '@/i18n/languages';
import Clipboard from '@react-native-clipboard/clipboard';
// import TaskQueue from "@/utils/TaskQueue";

import { useMessageModal } from '@/contexts/MessageModalContext';

// import { AudioPlayerController } from '@/utils/AudioPlayerController';

import SpeakBtn, { SpeakBtnRef } from '@/components/SpeakBtn'
import { StatusEnum } from '@/components/SpeakBtn';

// import { NativeModules, NativeEventEmitter } from 'react-native';
// const { HeadsetDetection } = NativeModules;
// const headsetEvents = new NativeEventEmitter(HeadsetDetection);

// export const listenHeadsetState = (cb: (plugged: boolean) => void) => {
//   HeadsetDetection.startListening();
//   const sub = headsetEvents.addListener('onHeadsetStateChanged', cb);
//   return () => {
//     sub.remove();
//     HeadsetDetection.stopListening();
//   };
// };

const { width } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width - pageLR * 2

// 启用 Android 支持
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}



const ListeningModeScreen: React.FC = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  // const [isPlay, setIsPlay] = useState(false); // 是否在播放音频
  const [isSlice, setIsSlice] = useState(false); // 是否切割分屏
  const [textSize, setTextSize] = useState(15); // 聊天文本字体大小
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 输入框state
  const translateY = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // const [broadcastSwitch, setBroadcastSwitch] = useState(false) // 播报开关

  const [isListening, setIsListening] = useState(false)

  const speakBtnRef = useRef<SpeakBtnRef>(null);

  const { show } = useMessageModal();

  // 是否连接耳机
  // const [isConnectHeadset, setIsConnectHeadset] = useState(false)

  const { language } = useLanguage();
  const [beforeLangSelect, setBeforeLangSelect] = useState(language)
  const [afterLangSelect, setAfterLangSelect] = useState<Language>('en')

  const scrollRef = useRef<ScrollView>(null);
  const scroll2Ref = useRef<ScrollView>(null);

  const maxTextSize = 25
  const minTextSize = 15

  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')

  const [sliceOpacity] = useState(new Animated.Value(0));

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  // const taskQueueRef = useRef<TaskQueue | null>(null)

  useEffect(() => {
    setTimeout(() => {
      scroll2Ref.current?.scrollToEnd({animated: true})
      scrollRef.current?.scrollToEnd({animated: true})
    }, 50)
    if (!isSlice && sourceText && translatedText) {
      sliceBtnClick()
    }
    
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceText, translatedText])

  useEffect(() => {
    // taskQueueRef.current = new TaskQueue();
    // const stop = listenHeadsetState((plugged) => {
    //   setIsConnectHeadset(plugged)
    //   if (!plugged) {
    //     console.log('未连接耳机');
    //     taskQueueRef.current?.pause()
    //     AudioPlayerController.getInstance().release()
    //     setBroadcastSwitch(false)
    //     // show({
    //     //   message: '耳机已断开，请连接耳机后使用'
    //     // })
    //   } else {
    //     console.log('已连接耳机');
    //   }
    // });
    const speakBtnRefInstance = speakBtnRef.current
    return () => {
      // stop();
      speakBtnRefInstance?.destroy()
      // taskQueueRef.current?.stop()
      // AudioPlayerController.getInstance().release()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   // const keyboardShow = Keyboard.addListener(
  //   //   Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
  //   //   (e: RNKeyboardEvent) => {
  //   //     const keyboardHeight = e.endCoordinates.height;
  //   //     Animated.timing(translateY, {
  //   //       toValue: Platform.OS === 'ios' ? -keyboardHeight : 0,
  //   //       duration: 250,
  //   //       useNativeDriver: true,
  //   //     }).start();
  //   //   }
  //   // );

  //   // const keyboardHide = Keyboard.addListener(
  //   //   Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
  //   //   () => {
  //   //     Animated.timing(translateY, {
  //   //       toValue: 100,
  //   //       duration: 250,
  //   //       useNativeDriver: true,
  //   //     }).start(() => setInputVisible(false));
  //   //   }
  //   // );

  //   return () => {
  //     // keyboardShow.remove();
  //     // keyboardHide.remove();
  //   };
  // }, [translateY]);

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  // const changeBroadcast = () => {
  //   if (broadcastSwitch) { // 播报已经打开
  //     // 这是要关闭
  //     setBroadcastSwitch(false)
  //     taskQueueRef.current?.pause()
  //     AudioPlayerController.getInstance().release()

  //   } else { // 播报未打开
  //     if (!isConnectHeadset) {
  //       show({
  //         message: '请先连接耳机'
  //       })
  //       return
  //     }
  //     setBroadcastSwitch(true)
  //     taskQueueRef.current?.runLastTaskNow()

  //   }
  // }

  // const playAudio = () => {
  //   if (isPlay) {

  //   }
  //   console.log('播放音频');
  //   // 先判断是否在聆听状态
  //   if (!isListening) {
  //     show({
  //       message: '请先启动聆听功能'
  //     })
  //     return
  //   }

  //   // 再判断有没有连接耳机
  //   if (isConnectHeadset) {
  //     setIsPlay(true)
  //   } else {
  //     show({
  //       message: '请先连接耳机'
  //     })
  //   }
    
  // }

  const changeTextSize = (type: string) => () => {
    console.log('放大缩小字体');
    if (type === 'big') {
      if (textSize >= maxTextSize) {
        setTextSize(maxTextSize)
      } else {
        setTextSize(textSize + 2)
      }
    } else {
      if (textSize <= minTextSize) {
        setTextSize(minTextSize)
      } else {
        setTextSize(textSize - 2)
      }
    }
  }

  const sliceBtnClick = () => {
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 动画配置
    setIsSlice((prev) => {
      // 显示出来时才播放淡入
      sliceOpacity.setValue(0);
      Animated.timing(sliceOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return true;
    });
  }

  // const handleStartInput = () =>{
  //   setInputVisible(true);
  //   setTimeout(() => {
  //     inputRef.current?.focus();
  //   }, 50)
  // }

  const inputFinish = (value: string) => {
    console.log('确认按钮点击，值为:', value);
    setInputValue('')
  }

  // 启动聆听服务
  const startListeningService = () => {
    if (!isListening) {
      console.log('启动');
      setLoading(true)
      speakBtnRef.current?.start()
      setIsSlice(false)
      setSourceText('')
      setTranslatedText('')
    } else {
      stopListeningService()
    }
    
  }

  // 关闭聆听服务
  const stopListeningService = () => {
    console.log('停止');
    setIsListening(false)
    setLoading(true)
    speakBtnRef.current?.stop()
    // taskQueueRef.current?.stop()
    // AudioPlayerController.getInstance().release()
  }

  // 播放音频
  // const startPlayAudio = async (audioUri: string) => {
  //   setIsPlay(true)
  //   await AudioPlayerController.getInstance().init(audioUri, {
  //     onInit: ({ duration, controller }) => {
  //       console.log('初始化完成，时长:', duration);
  //       console.log('controller----:', controller);
  //       controller.play();
  //     },
  //     onPlay: () => {
  //       console.log('播放中');

  //     },
  //     onPause: () => {
  //       console.log('暂停播放');
  //       // setIsPlay(false)
  //     },
  //     onStop: () => {
  //       console.log('停止播放');
  //     },
  //     onEnd: () => {
  //       console.log('播放完成');
  //       // stopPlayAudio()
  //     },
  //     onError: (error) => {
  //       console.error('错误:', error.message)
  //       // stopPlayAudio()
  //     },
  //   });
  // }

  // 处理聆听结果
  const listeningResultHandle = (data: any) => {
    console.log('聆听结果------', data);

    if (data?.source_text) {
      setSourceText(data?.source_text)
    }
    
    if (data?.translated_text) {
      setTranslatedText(data?.translated_text)
    }

    if (data?.status === 'success') {
      // 已经挂断后，最后的处理结果
      speakBtnRef.current?.destroy()
      setLoading(false)

    } else if (data?.status === 'processing') {
      // 应该是status='processing'
      // taskQueueRef.current?.push(() => {
      //     return new Promise<void>(async(resolve) => {
      //       try {
      //         await AudioPlayerController.getInstance().init(data?.translated_audio_url, {
      //           onInit: ({ duration, controller }) => {
      //             console.log('初始化完成，时长:', duration);
      //             console.log('controller----:', controller);
      //             controller.play();
      //           },
      //           onPlay: () => {
      //             console.log('播放中');

      //           },
      //           onPause: () => {
      //             console.log('暂停播放');
      //             // setIsPlay(false)
      //           },
      //           onStop: () => {
      //             console.log('停止播放');
      //             resolve()
      //           },
      //           onEnd: () => {
      //             console.log('播放完成');
      //             // stopPlayAudio()
      //             resolve()
      //           },
      //           onError: (error) => {
      //             console.error('错误:', error.message)
      //             // stopPlayAudio()
      //           },
      //         });
      //       } catch (e) {

      //       }
      //     })
        
      // })
    }
  }

  const copyText = () => {
    if (!sourceText && !translatedText) {
      show({
        message: t('translate_screen.no_listen_result')
      })
      return
    }
    let str = `${t('translate_screen.copy_tip_source')}:\n${sourceText}\n----------------------\n${t('translate_screen.copy_tip_translated')}:\n${translatedText}`
    Clipboard.setString(str);
    show({
      message: t('translate_screen.copy_success')
    })
  }

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text={t('translate_screen.listening_mode')}
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {
          isSlice &&
          <Animated.View style={[styles.animatedContainer]}>
            <ScrollView ref={scrollRef} style={[styles.scroll]} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={{fontSize: textSize, color: '#B0B0B0', lineHeight: textSize + 8}}>
                {sourceText}
              </Text>
            </ScrollView>
          </Animated.View>
        }
        {
          isSlice &&
          <View style={{height: 1, backgroundColor: '#B0B0B080', marginHorizontal: pageLR, marginVertical: pageLR}}></View>
        }

        {/* 对话滚动区域 */}
        <ScrollView ref={scroll2Ref} style={styles.scroll} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          {
            !isSlice &&
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[styles.noDataTipText, {textAlign: 'center'}]}>
                {isListening ? t('translate_screen.Oral_Listening') : `${t('translate_screen.listening_tip1')}\n${t('translate_screen.listening_tip2')}`}
              </Text>
            </View>
          }
          {
            isSlice &&
            <Text style={{fontSize: textSize, color: '#B0B0B0', lineHeight: textSize + 8}}>
              {translatedText}
            </Text>
          }
          
          
        </ScrollView>


        {/* 按钮操作区域 */}
        <View style={styles.contentOption}>
          <View style={styles.leftBtns}>
            {/* 播放音频按钮 */}
            {/* <TouchableOpacity onPress={changeBroadcast}>
              {
                broadcastSwitch ?
                <Image source={require('../../../assets/images/ChatScreen_PlayAudio_open.png')} style={styles.playAudioImg}/>
                :
                <Image source={require('../../../assets/images/ChatScreen_PlayAudio_close.png')} style={styles.playAudioImg}/>
              }
            </TouchableOpacity> */}
            {/* 放大字体 */}
            <TouchableOpacity onPress={changeTextSize('big')}>
              <Image source={require('../../../assets/images/ChatScreen_TextSize_Big.png')} style={styles.playAudioImg}/>
            </TouchableOpacity>
            {/* 缩小字体 */}
            <TouchableOpacity onPress={changeTextSize('small')}>
              <Image source={require('../../../assets/images/ChatScreen_TextSize_Small.png')} style={styles.playAudioImg}/>
            </TouchableOpacity>
          </View>
          {/* 复制按钮 */}
          <TouchableOpacity onPress={() => copyText()}>
            <Image source={require('../../../assets/images/ListeningScreen_Copy.png')} style={styles.copyImg}/>
          </TouchableOpacity>
        </View>
      </View>
      {/* 语言选择栏 */}
      <View style={styles.langSelectRow}>
        <LangSelectCard
          beforeLanguage={beforeLangSelect}
          afterLanguage={afterLangSelect}
          paddingTopBottom={0}
          textSize={12}
          marginRight={16}
          disabled={isListening}
          beforeSelectBack={(code) => {
            console.log('beforeSelectBack---', code);
            setBeforeLangSelect(code)
          }}
          afterSelectBack={(code) => {
            console.log('afterSelectBack---', code);
            setAfterLangSelect(code)
          }}
        />
        {/* 唤起输入框 */}
        {/* <TouchableOpacity style={styles.langQuickBtnNew} onPress={handleStartInput}>
            <Image source={require('../../../assets/images/SpeakerMode_Write.png')} style={styles.iconQuickLangNew}/>
        </TouchableOpacity> */}
        {/* 语音按钮 */}
        <TouchableOpacity style={[styles.langQuickBtnNew, {marginLeft: 10}]} onPress={startListeningService}>
          {
            isListening ?
            <Image source={require('../../../assets/images/Audio_Stop.png')}
              style={{width: 20, height: 20}}
            />
            :
            <Image source={require('../../../assets/images/SpeakerMode_Speak.png')} style={styles.iconQuickLangNew}/>
          }
            
        </TouchableOpacity>
      </View>
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
        timeout={5000}
        onTimeout={() => setLoading(false)}
      />
      {/* 输入框区域 */}
      {inputVisible && (
        <Animated.View
          style={[
            styles.inputWrapper,
            { transform: [{ translateY }] }
          ]}
        >
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={t('translate_screen.input_no_value')}
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus
            numberOfLines={1}
            multiline={false} // 强制单行
            underlineColorAndroid="transparent"
            placeholderTextColor="#B0B0B080"
            returnKeyType="done"
            onSubmitEditing={(e) => {
              const value = e.nativeEvent.text;
              inputFinish(value)
            }}
          />
        </Animated.View>
      )}
      <SpeakBtn
        ref={speakBtnRef}
        key={`speakBtn-${beforeLangSelect}-${afterLangSelect}`}
        beforeLanguage={beforeLangSelect}
        afterLanguage={afterLangSelect}
        hidden={true}
        mode={'listening'}
        tellResult={(data) => {
          listeningResultHandle(data)
        }}
        statusChange={(status) => {
          if (status === StatusEnum.TYPE_OPEN) {
            setLoading(false)
            setIsListening(true)
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#181819',
  },
  content: {
    flex: 1,
    width: contentWidth,
    marginLeft: pageLR,
    backgroundColor: '#262626',
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 16,
  },
  animatedContainer: {
    flex: 1, // 使容器充满父元素
    width: '100%', // 确保宽度充满
    justifyContent: 'center', // 垂直居中
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
    // paddingVertical: pageLR,
  },
  contentContainer: {
    paddingHorizontal: pageLR,
    flexGrow: 1,
  },
  contentOption: {
    flexDirection: 'row',
    paddingHorizontal: pageLR,
    alignItems: 'center',
    marginTop: 16,
  },
  noDataTipText: {
    fontSize: 16,
    color: '#B0B0B080',
  },

  leftBtns: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playAudioImg: {
    width: 22,
    height: 22,
  },
  copyImg: {
    width: 20,
    height: 20,
  },
  langSelectRow: {
    width: contentWidth,
    marginLeft: pageLR,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  langQuickBtnNew: {
    width: 44,
    height: 44,
    backgroundColor: '#333333',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLangNew: {
    width: 40,
    height: 40,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 0 : 10,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#181819',
  },
  input: {
    height: 40,
    borderRadius: 6,
    paddingHorizontal: 10,
    color: '#ccc',
    fontSize: 16,
    backgroundColor: '#262626',
  },
});

export default ListeningModeScreen;
