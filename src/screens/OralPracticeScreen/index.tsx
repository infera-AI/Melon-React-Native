// 口语练习页
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
  UIManager,
  Platform,
  Easing,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { useLanguage } from '@/contexts/LanguageContext';
import FullScreenLoader from '@/components/FullScreenLoader';
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import SpeakBtn, { SpeakBtnRef } from '@/components/SpeakBtn'
import {
  sendMsgToAI
} from '@/api/translate'

import { useMessageModal } from '@/contexts/MessageModalContext';

import { AudioPlayerController } from '@/utils/AudioPlayerController';

import { StatusEnum } from '@/components/SpeakBtn';
import { scaleSize, scaleFont } from '@/utils/scale';

const { width, height } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width

const ringWH = scaleSize(176)
const headWH = scaleSize(160)

// 启用 Android 支持
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const textSize = 15
const textLineHeight = textSize + 6

const OralPracticeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const pagerRef = useRef<PagerView>(null);

  const page2ScrollRef = useRef<ScrollView>(null);

  const [nowPageIndex, setNowPageIndex] = useState(0)

  const speakBtnRef = useRef<SpeakBtnRef>(null);

  const [pageStatus, setPageStatus] = useState<StatusEnum>(StatusEnum.TYPE_NORMAL)

  const [chatList, setChatList] = useState<any>([])

  const msgLoadRotateAnim = useRef(new Animated.Value(0)).current;
  const rotateAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (pageStatus === StatusEnum.TYPE_WAIT_ANSWER || pageStatus === StatusEnum.TYPE_TRANSLATION_OVER) {
      
      msgLoadRotateAnim.setValue(0)
      const loopAnim = Animated.loop(
        Animated.timing(msgLoadRotateAnim, {
          toValue: 360,
          duration: 2000, // 2秒一圈
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotateAnimRef.current = loopAnim
      loopAnim.start()
    } else {
      rotateAnimRef.current?.stop()
    }
    
  }, [msgLoadRotateAnim, pageStatus]);

  const spin = msgLoadRotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const { show } = useMessageModal();

  const goToPage = (pageIndex: number) => {
    console.log('setPage----', pageIndex);
    
    pagerRef.current?.setPage(pageIndex); // 或 setPageWithoutAnimation
  };

  const switchPage = () => {
    const nextPage = nowPageIndex === 0 ? 1 : 0;
    setNowPageIndex(nextPage)
    goToPage(nextPage)
    const bgOpacity = nextPage === 0 ? 1 : 0.3;
    changePageBgOpqcity(bgOpacity)
  }

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  const bgImgOpacity = useRef(new Animated.Value(1)).current;

  const [isAnimating, setIsAnimating] = useState(false)
  const rotate1 = useRef(new Animated.Value(0)).current;
  const rotate2 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const ROTATE_DURATION = 6000; // 越小转的越快
  const SCALE_DURATION = 1000;
  const OPACITY_DURATION = 800;

  useEffect(() => {
    let rotate1Anim: Animated.CompositeAnimation;
    let rotate2Anim: Animated.CompositeAnimation;
    let scaleAnim: Animated.CompositeAnimation;
    let opacityAnim: Animated.CompositeAnimation;

    if (isAnimating) {
      rotate1.setValue(0);
      rotate2.setValue(0);
      scale.setValue(1);
      opacity.setValue(1);

      rotate1Anim = Animated.loop(
        Animated.timing(rotate1, {
          toValue: 1,
          duration: ROTATE_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        })
      );

      rotate2Anim = Animated.loop(
        Animated.timing(rotate2, {
          toValue: 1,
          duration: ROTATE_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
          isInteraction: false,
        })
      );

      scaleAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.12,
            duration: SCALE_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: SCALE_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      opacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: OPACITY_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: OPACITY_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      rotate1Anim.start();
      rotate2Anim.start();
      scaleAnim.start();
      opacityAnim.start();
    } else {
      rotate1.stopAnimation();
      rotate2.stopAnimation();
      scale.stopAnimation();
      opacity.stopAnimation();
    }

    return () => {
      rotate1.stopAnimation();
      rotate2.stopAnimation();
      scale.stopAnimation();
      opacity.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating]);

  useEffect(() => {
    setIsAnimating(true)

    const speakBtnRefInstance = speakBtnRef.current; // 必须在这里复制
    return () => {
      if (speakBtnRefInstance) {
        speakBtnRefInstance.destroy();  // 不直接用 ref.current
      }
      stopPlayAudio()
    }
  }, [])

  const changePageBgOpqcity = (val: number) => {
    Animated.timing(bgImgOpacity, {
      toValue: val,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }

  const rotate1Interpolate = rotate1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotate2Interpolate = rotate2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });


  const phoneOff = () => {
    // 关闭音频
    speakBtnRef.current?.destroy()
    navigation.goBack()
  }

  const stopPlayAudio = () => {
    // 关闭音频
    AudioPlayerController.getInstance().release()
    setPageStatus(StatusEnum.TYPE_NORMAL)
  }

  const startPlayAudio = async (audioUri: string) => {
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

  useEffect(() => {
    page2ScrollRef.current?.scrollToEnd({animated: true})
  }, [chatList])

  const tellResultHandle = (data: any) => {
    console.log('tellResult----', data);
    if (data?.status === 'success') { // 只处理成功即可，失败时，在内部弹窗显示
      setPageStatus(StatusEnum.TYPE_WAIT_ANSWER)
      // 先push到聊天记录
      setChatList([
        ...chatList, 
        {
          role: 'user',
          msg: data?.source_text
        },
        {
          role: 'wait',
        }
      ])
      // 发送消息
      sendMsgToAI({
        text_message: data?.source_text
      }).then((rsp) => {
        console.log('rsp------', rsp);
        if (rsp) {
          if (rsp?.assistant_reply_audio_url) {
            setPageStatus(StatusEnum.TYPE_PLAY_ANSWER_AUDIO)
            startPlayAudio(rsp?.assistant_reply_audio_url)
          } else {
            setPageStatus(StatusEnum.TYPE_NORMAL)
          }

          changeChatList('success', rsp?.assistant_reply)
          

        } else {
          // 响应失败
          setPageStatus(StatusEnum.TYPE_NORMAL)
          show({
            message: t('translate_screen.failed_again')
          })
          changeChatList('error')
        }
        
      }).catch(() => {
        // 响应失败
        setPageStatus(StatusEnum.TYPE_NORMAL)
        show({
          message: t('translate_screen.failed_again')
        })
        changeChatList('error')
      })
    }
    
  }

  const changeChatList = (type: string, msg?: string) => {
    let obj: any = {}
    if (type === 'error') {
      obj = {role: 'error'}
    } else {
      obj = {role: 'ai', msg}
    }

    setChatList((prev: any) => {
      if (prev.length === 0) return prev; // 空数组不动
      // 替换最后一个
      return [...prev.slice(0, -1), obj];
    })
  }

  return (
    <View style={[
      styles.root,
      {
        paddingTop: insets.top > 0 ? insets.top : 0,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <Animated.View style={[styles.pageBg, {opacity: bgImgOpacity}]}>
        <Image
          source={require('../../../assets/images/OralPractice_page_bg.png')}
          resizeMode={'cover'}
          style={styles.pageBgImg}
        />
      </Animated.View>
      <CustomNavigation
        rightBtnText={nowPageIndex === 0 ? t('translate_screen.Oral_page1_switch') : t('translate_screen.Oral_page2_switch')}
        rightBtnClick={() => switchPage()}
        backgroundColor="transparent"
        useTopSafeArea={false}
      />
      <PagerView ref={pagerRef} style={styles.pagerView} initialPage={0} scrollEnabled={false}>
        {/* 界面1 */}
        <View key="1" style={[styles.page, styles.firstPage]}>
          {
            isAnimating &&
            <>
              <Animated.View
                style={[
                  styles.ring,
                  {
                    transform: [{ rotate: rotate1Interpolate }, { scale }],
                    opacity,
                    position: 'absolute',
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/images/Oral_head_animate1.png')} // 第一层不规则绿色圈图
                  style={styles.ringImage}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.ring,
                  {
                    transform: [{ rotate: rotate2Interpolate }, { scale }],
                    opacity,
                    position: 'absolute',
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/images/Oral_head_animate2.png')} // 第二层可以用相同图或另一个图
                  style={styles.ringImage}
                />
              </Animated.View>
            </>
          }
          
          {/* 头像 */}
          <View style={styles.avatarPlaceholder}>
            <Image
              source={require('../../../assets/images/Home_card_head.png')}
              style={styles.headImg}
              resizeMode='cover'
            />
          </View>
        </View>

        {/* 界面2 */}
        <View key="2" style={[styles.page]}>
          <ScrollView
            ref={page2ScrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.msgItems}>
              {
                chatList.map((item: any, index:any) => {
                  return (
                    <React.Fragment key={index}>
                      {
                        item?.role === 'user' ?
                          // {/* 我的消息 */}
                          <View style={[styles.msgItem, styles.msgItemMy]}>
                            <View style={[styles.msgTextView, styles.msgTextViewMy]}>
                              <View style={[styles.msgTextViewPop, styles.msgTextViewPopMy]}>
                                <Text style={[styles.msgText, styles.msgTextMy, {fontSize: textSize, lineHeight: textLineHeight}]}>
                                  {item?.msg}
                                </Text>
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
                          // {/* 对方的消息 */}
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
                                {
                                  item?.role === 'wait' ?
                                  <Animated.Image
                                    source={require('../../../assets/images/loading.png')}
                                    style={[styles.waitLoadImg, {transform: [{rotate: spin}]}]}
                                    resizeMode={'contain'}
                                  />
                                  :
                                  <Text style={[styles.msgText, styles.msgTextOther, {fontSize: textSize, lineHeight: textLineHeight}]}>
                                    {item?.role === 'error' ? t('translate_screen.failed_again') : item?.msg}
                                  </Text>
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

          </ScrollView>
        </View>
      </PagerView>
      <View style={styles.statusView}>
        {/* 状态 */}
        <TouchableOpacity
          style={[
            {alignItems: 'center'},
            pageStatus !== StatusEnum.TYPE_PLAY_ANSWER_AUDIO && {pointerEvents: 'none'}
          ]}
          onPress={() => stopPlayAudio()}
        >
          <View style={[styles.voiceAnimate, {alignItems: 'flex-end'}]}>
              {
                pageStatus === StatusEnum.TYPE_PLAY_ANSWER_AUDIO &&
                <Text>
                  <FontAwesome6 name='stop' size={20} color={'#85F380'}/>
                </Text>
              }
          </View>
          <Text style={styles.statusText}>
            {
                pageStatus === StatusEnum.TYPE_NORMAL ?
                  t('translate_screen.Oral_wait_speak')
                  :
                  pageStatus === StatusEnum.TYPE_INIT ?
                    t('translate_screen.Oral_wait_mic')
                    :
                    pageStatus === StatusEnum.TYPE_OPEN ?
                      t('translate_screen.Oral_Listening')
                      :
                      pageStatus === StatusEnum.TYPE_WAIT_TRANSLATION_RESULT ||
                      pageStatus === StatusEnum.TYPE_WAIT_ANSWER ||
                      pageStatus === StatusEnum.TYPE_TRANSLATION_OVER ?
                        t('translate_screen.Oral_handle_wait')
                        :
                        pageStatus === StatusEnum.TYPE_PLAY_ANSWER_AUDIO ?
                          t('translate_screen.Oral_cut_tip')
                          :
                          ''
              }
          </Text>
        </TouchableOpacity>
        {/* {
          <>
            <View style={styles.voiceAnimate}>
              <View style={[styles.voiceItem]}></View>
              <View style={[styles.voiceItem, {height: 20}]}></View>
              <View style={[styles.voiceItem, {height: 15}]}></View>
              <View style={[styles.voiceItem, {height: 35}]}></View>
              <View style={[styles.voiceItem, {height: 18}]}></View>
              <View style={[styles.voiceItem, {height: 22}]}></View>
              <View style={[styles.voiceItem, {height: 40}]}></View>
              <View style={[styles.voiceItem, {height: 18}]}></View>
              <View style={[styles.voiceItem, {height: 15}]}></View>
            </View>
            <Text style={styles.statusText}>
              Listening...
            </Text>
          </>
        } */}
      </View>
      <View style={styles.optionView}>
        {/* 语音按钮 */}
        <SpeakBtn
          ref={speakBtnRef}
          onlyRecognition={true}
          disabled={
            pageStatus === StatusEnum.TYPE_WAIT_ANSWER ||
            pageStatus === StatusEnum.TYPE_TRANSLATION_OVER ||
            pageStatus === StatusEnum.TYPE_WAIT_TRANSLATION_RESULT
          }
          tellResult={(data) => {
            tellResultHandle(data)
          }}
          statusChange={(status) => {
            console.log('status------', status);
            setPageStatus(status)
          }}
          renderContent={() => {
            return (
              <View style={styles.btnNew}>
                  <Image source={require('../../../assets/images/SpeakerMode_Speak.png')} style={styles.btnImg}/>
              </View>
            )
          }}

        />
        
        {/* 挂断按钮 */}
        <TouchableOpacity
          style={styles.btnNew}
          activeOpacity={0.8}
          onPress={() => phoneOff()}
          // onPress={() => setIsAnimating(!isAnimating)}
        >
            <Text>
              <Ionicons name='close-outline' size={scaleFont(14)} color={'#EA4335'}/>
            </Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.content}>
        <Text>11</Text>
      </View> */}
      
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
        timeout={5000}
        onTimeout={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#181819',
  },
  pageBg: {
    width: width,
    height: height,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  pageBgImg: {
    width: width,
    height: height,
  },
  pagerView: {
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    flex: 1,
  },
  firstPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  msgItems: {
    gap: 20,
    marginVertical: 20,
  },
  msgItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  msgTextView: {
    flex: 1,
    maxWidth: '80%'
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
  msgItemMy: {
    justifyContent: 'flex-end',
  },
  msgTextViewMy: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  msgTextViewPopMy: {
    borderRadius: 14,
    backgroundColor: '#3E3E3E',
  },
  msgTextMy: {
    color: '#85F380',
  },
  msgItemOther: {
    justifyContent: 'flex-start',
  },
  msgTextViewOther: {
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  msgTextViewPopOther: {
    borderRadius: 14,
    backgroundColor: '#00000052',
  },
  msgTextOther: {
    color: '#ffffff',
  },
  waitLoadImg: {
    width: scaleSize(20),
    height: scaleSize(20),
  },

  ring: {
    width: ringWH,
    height: ringWH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringImage: {
    width: ringWH,
    height: ringWH,
    resizeMode: 'contain',
  },
  avatarPlaceholder: {
    width: headWH,
    height: headWH,
    borderRadius: '50%',
    backgroundColor: '#C1E3D6',
    marginRight: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headImg: {
    width: '100%',
    height: '100%',
  },
  statusView: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#ff00ff',
    marginBottom: 20,
  },
  statusText: {
    fontSize: scaleFont(5.2),
    color: '#85F380',
    marginTop: 10,
    marginLeft: 10,
  },
  voiceAnimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    height: 40,
  },
  voiceItem: {
    height: 10,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#85F380'
  },
  optionView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
    marginBottom: 20
  },
  btnNew: {
    width: scaleSize(66),
    height: scaleSize(66),
    backgroundColor: '#3E3E3E',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnImg: {
    width: '80%',
    height: '80%',
  },
  // content: {
  //   flex: 1,
  //   width: contentWidth,
    
  // },
});

export default OralPracticeScreen;
