// 耳机模式页面
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
import { AudioPlayerController } from '@/utils/AudioPlayerController';
import {
  translationText
} from '@/api/translate'
import { scaleSize, scaleFont } from '@/utils/scale';
import SelectSpeakBtnModal, { SelectSpeakBtnModalRef } from '@/components/SelectSpeakBtnModal'
import { useMessageModal } from '@/contexts/MessageModalContext';

import { NativeModules, NativeEventEmitter } from 'react-native';
const { HeadsetDetection } = NativeModules;
const headsetEvents = new NativeEventEmitter(HeadsetDetection);
import { useUnifiedHeadsetListener } from '@/contexts/useUnifiedHeadsetListener';

export const listenHeadsetState = (cb: (plugged: boolean) => void) => {
  HeadsetDetection.startListening();
  const sub = headsetEvents.addListener('onHeadsetStateChanged', cb);
  return () => {
    sub.remove();
    HeadsetDetection.stopListening();
  };
};

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



const HeadphoneModeScreen: React.FC = () => {

  

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [broadcastSwitch, setBroadcastSwitch] = useState(true); // 播报开关
  const [isPlay, setIsPlay] = useState(false); // 是否在播放音频
  const [isSlice, setIsSlice] = useState(false); // 是否切割分屏
  const [textSize, setTextSize] = useState(15); // 聊天文本字体大小
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 输入框state
  const translateY = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const { show } = useMessageModal();

  const [speakBtnModalVisible, setSpeakBtnModalVisible] = useState(false)

  const scrollRef = useRef<ScrollView>(null);
  const scroll2Ref = useRef<ScrollView>(null);

  const { language } = useLanguage();
  const [beforeLangSelect, setBeforeLangSelect] = useState(language)
  const [afterLangSelect, setAfterLangSelect] = useState<Language>('en')

  const [chatList, setChatList] = useState<any>([])

  const maxTextSize = 25
  const minTextSize = 15

  const [sliceOpacity] = useState(new Animated.Value(0));

  const insets = useSafeAreaInsets(); // 获取安全区域距离
  
  const SelectSpeakBtnModalRef = useRef<SelectSpeakBtnModalRef>(null);

  // 监听耳机连接状态变化
  useUnifiedHeadsetListener((isConnected) => {
    console.log('耳机连接状态：', isConnected);
    if (!isConnected) {
      show({
        message: t('translate_screen.headset_cut_tip')
      })
      navigation.goBack()
    }
  });

  useEffect(() => {
    const keyboardShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: RNKeyboardEvent) => {
        const keyboardHeight = e.endCoordinates.height;
        Animated.timing(translateY, {
          toValue: Platform.OS === 'ios' ? -keyboardHeight : 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setInputVisible(false));
      }
    );

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, [translateY]);

  // useEffect(() => {
  //   if (
  //     pageStatus === StatusEnum.TYPE_WAIT_TRANSLATION_RESULT ||
  //     pageStatus === StatusEnum.TYPE_WAIT_ANSWER
  //   ) {
  //     // setSpeakBtnModalVisible(false)
  //     setLoading(true)
  //   } else {
  //     setLoading(false)
  //   }
  // }, [pageStatus])

  useEffect(() => {
    setTimeout(() => {
        scroll2Ref.current?.scrollToEnd({animated: false})
        scrollRef.current?.scrollToEnd({animated: true})
      }, 50)
    

  }, [chatList])

  useEffect(() => {
    setTimeout(() => {
        scroll2Ref.current?.scrollToEnd({animated: false})
        scrollRef.current?.scrollToEnd({animated: true})
      }, 500)
    

  }, [isSlice])

  useEffect(() => {
    let stop:any
    if (Platform.OS === 'ios') {
      stop = listenHeadsetState((plugged) => {
        if (!plugged) {
          show({
            message: t('translate_screen.headset_cut_tip')
          })
          navigation.goBack()
        }
      });
    }


    const SelectSpeakBtnModalRefInstance = SelectSpeakBtnModalRef.current
    return () => {
      stopPlayAudio()
      SelectSpeakBtnModalRefInstance?.destroy()
      stop && stop();
      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  // 设置播报开关
  const setBroadcast = () => {
    setBroadcastSwitch(!broadcastSwitch)
  }

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

  const sliceBtnClick = () => () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 动画配置
    // setIsSlice(!isSlice)
    setIsSlice((prev) => {
      const next = !prev;
      if (!prev) {
        // 显示出来时才播放淡入
        sliceOpacity.setValue(0);
        Animated.timing(sliceOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
      return next;
    });
  }

  const handleStartInput = () =>{
    setInputVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50)
  }

  // 发送文本消息
  const inputFinish = (value: string) => {
    console.log('确认按钮点击，值为:', value);
    setLoading(true)
    // 先调接口翻译
    translationText({
      source_text: value,
      source_language: beforeLangSelect,
      target_language: afterLangSelect,
    }).then((rsp) => {
      setLoading(false)
      if (rsp) {
        // 拿到翻译结果和音频后设置聊天记录
        changeChatList('user', rsp)

        // 音频链接存在，并且播报开关打开时，自动播放声音
        if (rsp?.translated_audio_url && broadcastSwitch) {
          startPlayAudio(rsp?.translated_audio_url)
        }
      }
    }).catch(() => {
      setLoading(false)
    })
    
    setInputValue('')
  }

  const tellResultHandle = (type: string, data: any) => {
    console.log('tellResult----', data);
    if (data?.status === 'success') {
      // 拿到翻译结果和音频后设置聊天记录, 目前无法区分是用户还是他人
      changeChatList(type, {
        source_text: data?.source_text,
        translated_text: data?.translated_text,
        translated_audio_url: data?.translated_audio_url
      })

      // 音频链接存在，并且播报开关打开时，自动播放声音
      if (data?.translated_audio_url && broadcastSwitch) {
        startPlayAudio(data?.translated_audio_url)
      }
    }
  }

  const changeChatList = (type: string, msgObj?: any) => {
    let obj = {
      role: type,
      ...msgObj
    }

    setChatList([
      ...chatList,
      obj
    ])
  }

  const stopPlayAudio = () => {
      // 关闭音频
    AudioPlayerController.getInstance().release()
    setIsPlay(false)
  }

  const startPlayAudio = async (audioUri: string) => {
    setIsPlay(true)
    await AudioPlayerController.getInstance().init(audioUri, {
      onInit: ({ duration, controller }) => {
        console.log('初始化完成，时长:', duration);
        console.log('controller----:', controller);
        controller.play();
      },
      onPlay: () => {
        console.log('播放中');

      },
      onPause: () => {
        console.log('暂停播放');
        // setIsPlay(false)
      },
      onStop: () => {
        console.log('停止播放');
      },
      onEnd: () => {
        console.log('播放完成');
        stopPlayAudio()
      },
      onError: (error) => {
        console.error('错误:', error.message)
        stopPlayAudio()
      },
    });
  }

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text={t('translate_screen.headPhone_mode')}
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {
          isSlice &&
          <Animated.View style={[styles.animatedContainer, { opacity: sliceOpacity }]}>
            <ScrollView
              ref={scroll2Ref}
              key={chatList?.length}
              style={[styles.scroll, styles.scaleYStyle]}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="handled"
            >
              {
                !chatList.length ?
                <View style={styles.scaleXStyle}>
                  <Text style={styles.noDataTipText}>
                    {t('translate_screen.Speaker_noData_tip')}
                  </Text>
                </View>
                
                :
                <View style={styles.msgItems}>
                  {
                    chatList.map((item: any, index: number) => {
                      return (
                        <React.Fragment key={`again${index}`}>
                          {
                            item?.role === 'user' ?
                            // 我的消息
                            <View style={[styles.msgItem, styles.msgItemMy]}>
                              <View style={[styles.msgTextView, styles.msgTextViewMy]}>
                                <View style={[styles.msgTextViewPop, styles.msgTextViewPopMy]}>
                                  {/* <Text style={[styles.msgText, styles.msgTextMy, styles.scaleXStyle]}>
                                    你什么时候回国？
                                  </Text>
                                  <View style={[styles.lineView, styles.lineViewMy]}/> */}
                                  <View style={styles.scaleXStyle}>
                                    <Text style={[
                                        styles.msgText,
                                        styles.msgTextMy,
                                        {fontSize: textSize}
                                      ]}
                                    >
                                      {item?.translated_text}
                                    </Text>
                                  </View>
                                  
                                </View>
                              </View>
                              <View style={styles.headContent}>
                                <Image
                                  source={{ uri: 'https://img0.baidu.com/it/u=1972874754,2380280904&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500' }}
                                  style={styles.headImg}
                                  resizeMode='cover'
                                />
                              </View>
                            </View>
                            :
                            // 对方的消息
                            <View style={[styles.msgItem, styles.msgItemOther]}>
                              <View style={styles.headContent}>
                                <Image
                                  source={require('../../../assets/images/Home_card_head.png')}
                                  style={styles.headImg}
                                  resizeMode='cover'
                                />
                              </View>
                              <View style={[styles.msgTextView, styles.msgTextViewOther]}>
                                <View style={[styles.msgTextViewPop, styles.msgTextViewPopOther]}>
                                  {/* <Text style={[styles.msgText, styles.msgTextOther, styles.scaleXStyle]}>
                                    我下周三回去
                                  </Text>
                                  <View style={[styles.lineView, styles.lineViewOther]}/> */}
                                  <View style={styles.scaleXStyle}>
                                    <Text style={[styles.msgText, styles.msgTextOther, {fontSize: textSize}]}>
                                      {item?.source_text}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          }
                        </React.Fragment>
                      )
                    })
                  }
                  
                </View>
              }
            </ScrollView>
          </Animated.View>
        }

        {
          isSlice &&
          <View style={{height: 1, backgroundColor: '#B0B0B080', marginHorizontal: pageLR, marginVertical: 16,}}></View>
        }

        {/* 对话滚动区域 */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {
            !chatList.length ?
            <Text style={styles.noDataTipText}>
              {t('translate_screen.Speaker_noData_tip')}
            </Text>
            :
            <View style={styles.msgItems}>
              {
                chatList.map((item: any, index: number) => {
                  return (
                    <React.Fragment key={index}>
                      {
                        item?.role === 'user' ?
                        // 我的消息
                        <View style={[styles.msgItem, styles.msgItemMy]}>
                          <View style={[styles.msgTextView, styles.msgTextViewMy]}>
                            <View style={[styles.msgTextViewPop, styles.msgTextViewPopMy]}>
                              <Text style={[styles.msgText, styles.msgTextMy, {fontSize: textSize}]}>
                                {item?.source_text}
                              </Text>
                              {
                                isSlice ?
                                null
                                :
                                <>
                                  <View style={[styles.lineView, styles.lineViewMy]}/>
                                  <Text style={[styles.msgText, styles.msgTextMy, {fontSize: textSize}]}>
                                    {item?.translated_text}
                                  </Text>
                                </>
                              }
                              
                            </View>
                          </View>
                          <View style={styles.headContent}>
                            <Image
                              source={{ uri: 'https://img0.baidu.com/it/u=1972874754,2380280904&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500' }}
                              style={styles.headImg}
                              resizeMode='cover'
                            />
                          </View>
                        </View>
                        :
                        // 对方的消息
                        <View style={[styles.msgItem, styles.msgItemOther]}>
                          <View style={styles.headContent}>
                            <Image
                              source={require('../../../assets/images/Home_card_head.png')}
                              style={styles.headImg}
                              resizeMode='cover'
                            />
                          </View>
                          <View style={[styles.msgTextView, styles.msgTextViewOther]}>
                            <View style={[styles.msgTextViewPop, styles.msgTextViewPopOther]}>
                              <Text style={[styles.msgText, styles.msgTextOther, {fontSize: textSize}]}>
                                {item?.translated_text}
                              </Text>
                              {
                                isSlice ?
                                null
                                :
                                <>
                                  <View style={[styles.lineView, styles.lineViewOther]}/>
                                  <Text style={[styles.msgText, styles.msgTextOther, {fontSize: textSize}]}>
                                    {item?.source_text}
                                  </Text>
                                </>
                              }
                            </View>
                          </View>
                        </View>
                      }
                    </React.Fragment>
                  )
                })
              }

            </View>
          }
        </ScrollView>


        {/* 按钮操作区域 */}
        <View style={styles.contentOption}>
          <View style={styles.leftBtns}>
            {/* 播放音频按钮 */}
            {/* <TouchableOpacity onPress={setBroadcast}>
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
          {/* 分屏按钮 */}
          <TouchableOpacity onPress={sliceBtnClick()}>
            {
              isSlice ?
              <Image source={require('../../../assets/images/ChatScreen_Slice_open.png')} style={styles.playAudioImg}/>
              :
              <Image source={require('../../../assets/images/ChatScreen_Slice_close.png')} style={styles.playAudioImg}/>
            }
          </TouchableOpacity>
        </View>
      </View>
      {/* 语言选择栏 */}
      <View style={styles.langSelectRow}>
        <LangSelectCard
          beforeLanguage={beforeLangSelect}
          afterLanguage={afterLangSelect}
          marginRight={16}
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
        <TouchableOpacity style={styles.langQuickBtnNew} onPress={handleStartInput}>
            <Image source={require('../../../assets/images/SpeakerMode_Write.png')} style={styles.iconQuickLangNew}/>
        </TouchableOpacity>
        {/* 语音按钮 */}
        {/* isPlay时要禁用 */}
        <TouchableOpacity
          onPress={() => setSpeakBtnModalVisible(true)}
          style={isPlay && styles.disabledDom}
        >
          <View style={[styles.langQuickBtnNew, {marginLeft: 10}]}>
              <Image source={require('../../../assets/images/SpeakerMode_Speak.png')} style={styles.iconQuickLangNew}/>
          </View>
        </TouchableOpacity>
      </View>
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
        timeout={20000}
        onTimeout={() => setLoading(false)}
      />
      {/* 通话按钮弹窗， 区分是本人说话还是对方说话 */}
      <SelectSpeakBtnModal
        visible={speakBtnModalVisible}
        key={`speakBtnModal-${beforeLangSelect}-${afterLangSelect}`}
        beforeLanguage={beforeLangSelect}
        afterLanguage={afterLangSelect}
        onBackdropPress={() => setSpeakBtnModalVisible(false)}
        tellResult={(type: string, data: any) => {
          tellResultHandle(type, data)
        }}
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
    paddingVertical: pageLR,
    backgroundColor: '#262626',
    borderRadius: 10,
    overflow: 'hidden',
  },
  animatedContainer: {
    flex: 1, // 使容器充满父元素
    width: '100%', // 确保宽度充满
    justifyContent: 'center', // 垂直居中
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
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


  msgItems: {
    gap: 20,
  },
  msgItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  msgTextView: {
    flex: 1,
  },
  msgText: {
    maxWidth: '100%',
  },
  msgTextViewPop: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headContent: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    overflow: 'hidden',
  },
  headImg: {
    width: '100%',
    height: '100%',
  },
  lineView: {
    alignSelf: 'stretch',
    height: 1,
    marginVertical: scaleSize(10),
  },
  lineViewMy: {
    backgroundColor: '#b0b0b06a',
  },
  msgItemMy: {
    justifyContent: 'flex-end',
  },
  msgTextViewMy: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  msgTextViewPopMy: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#3E3E3E',
  },
  msgTextMy: {
    color: '#85F380',
  },
  lineViewOther: {
    backgroundColor: '#3E3E3E6a',
  },
  msgItemOther: {
    justifyContent: 'flex-start',
  },
  msgTextViewOther: {
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  msgTextViewPopOther: {
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: '#878787',
  },
  msgTextOther: {
    color: '#303437',
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
  langSelectRow: {
    width: contentWidth,
    marginLeft: pageLR,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  
  disabledDom: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  langQuickBtnNew: {
    width: scaleSize(44),
    height: scaleSize(44),
    backgroundColor: '#333333',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLangNew: {
    width: '80%',
    height: '80%',
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
  scaleXStyle: {
    transform: [{ scaleX: -1 }]
  },
  scaleYStyle: {
    transform: [{ scaleY: -1 }]
  },
});

export default HeadphoneModeScreen;
