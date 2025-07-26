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
import Modal from 'react-native-modal';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { KeyboardEvent as RNKeyboardEvent } from 'react-native';

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
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlay, setIsPlay] = useState(false); // 是否在播放音频
  const [isSlice, setIsSlice] = useState(false); // 是否切割分屏
  const [textSize, setTextSize] = useState(15); // 聊天文本字体大小
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 输入框state
  const translateY = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const maxTextSize = 25
  const minTextSize = 15

  const [sliceOpacity] = useState(new Animated.Value(0));

  const insets = useSafeAreaInsets(); // 获取安全区域距离

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

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  const playAudio = () => {
    console.log('播放音频');
    setIsPlay(!isPlay)
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

  const inputFinish = (value: string) => {
    console.log('确认按钮点击，值为:', value);
    setInputValue('')
  }

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text="Headphone Mode"
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {
          isSlice &&
          <Animated.View style={[styles.animatedContainer, { opacity: sliceOpacity }]}>
            <ScrollView style={[styles.scroll, {transform: [{ scaleY: -1 }]}]} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
              {/* <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={[styles.noDataTipText, {textAlign: 'center'}]}>
                  {`Press and hold the voice button to speak, and send loosely\n\nThe translation will be broadcast in the headphones, and you can wear one of the headphones with the other person`}
                </Text>
              </View> */}
              <View style={styles.msgItems}>
                {/* 我的消息 */}
                <View style={[styles.msgItem, styles.msgItemMy]}>
                  <View style={[styles.msgTextView, styles.msgTextViewMy]}>
                    <View style={[styles.msgTextViewPop, styles.msgTextViewPopMy]}>
                      {/* <Text style={[styles.msgText, styles.msgTextMy, {transform: [{ scaleX: -1 }]}]}>
                        你什么时候回国？
                      </Text>
                      <View style={[styles.lineView, styles.lineViewMy]}/> */}
                      <Text style={[styles.msgText, styles.msgTextMy, {transform: [{ scaleX: -1 }], fontSize: textSize}]}>
                        いつ帰国しますか？
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
                
                {/* 对方的消息 */}
                <View style={[styles.msgItem, styles.msgItemOther]}>
                  <View style={styles.headContent}>
                    <Image
                      source={{ uri: 'https://img0.baidu.com/it/u=1972874754,2380280904&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500' }}
                      style={styles.headImg}
                      resizeMode='cover'
                    />
                  </View>
                  <View style={[styles.msgTextView, styles.msgTextViewOther]}>
                    <View style={[styles.msgTextViewPop, styles.msgTextViewPopOther]}>
                      {/* <Text style={[styles.msgText, styles.msgTextOther, {transform: [{ scaleX: -1 }]}]}>
                        我下周三回去
                      </Text>
                      <View style={[styles.lineView, styles.lineViewOther]}/> */}
                      <Text style={[styles.msgText, styles.msgTextOther, {transform: [{ scaleX: -1 }], fontSize: textSize}]}>
                        来週の水曜日に帰ります。
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            <View style={{height: 1, backgroundColor: '#B0B0B080', marginHorizontal: pageLR, marginVertical: 16,}}></View>
          </Animated.View>
        }



        {/* 对话滚动区域 */}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          {/* <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={[styles.noDataTipText, {textAlign: 'center'}]}>
              {`Press and hold the voice button to speak, and send loosely\n\nThe translation will be broadcast in the headphones, and you can wear one of the headphones with the other person`}
            </Text>
          </View> */}
          <View style={styles.msgItems}>
            {/* 我的消息 */}
            <View style={[styles.msgItem, styles.msgItemMy]}>
              <View style={[styles.msgTextView, styles.msgTextViewMy]}>
                <View style={[styles.msgTextViewPop, styles.msgTextViewPopMy]}>
                  <Text style={[styles.msgText, styles.msgTextMy, {fontSize: textSize}]}>
                    你什么时候回国？
                  </Text>
                  {
                    isSlice ?
                    null
                    :
                    <>
                      <View style={[styles.lineView, styles.lineViewMy]}/>
                      <Text style={[styles.msgText, styles.msgTextMy, {fontSize: textSize}]}>
                        いつ帰国しますか？
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
            
            {/* 对方的消息 */}
            <View style={[styles.msgItem, styles.msgItemOther]}>
              <View style={styles.headContent}>
                <Image
                  source={{ uri: 'https://img0.baidu.com/it/u=1972874754,2380280904&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500' }}
                  style={styles.headImg}
                  resizeMode='cover'
                />
              </View>
              <View style={[styles.msgTextView, styles.msgTextViewOther]}>
                <View style={[styles.msgTextViewPop, styles.msgTextViewPopOther]}>
                  <Text style={[styles.msgText, styles.msgTextOther, {fontSize: textSize}]}>
                    我下周三回去
                  </Text>
                  {
                    isSlice ?
                    null
                    :
                    <>
                      <View style={[styles.lineView, styles.lineViewOther]}/>
                      <Text style={[styles.msgText, styles.msgTextOther, {fontSize: textSize}]}>
                        来週の水曜日に帰ります。
                      </Text>
                    </>
                  }
                </View>
              </View>
            </View>
          </View>
          
        </ScrollView>


        {/* 按钮操作区域 */}
        <View style={styles.contentOption}>
          <View style={styles.leftBtns}>
            {/* 播放音频按钮 */}
            <TouchableOpacity onPress={playAudio}>
              {
                isPlay ?
                <Image source={require('../../../assets/images/ChatScreen_PlayAudio_open.png')} style={styles.playAudioImg}/>
                :
                <Image source={require('../../../assets/images/ChatScreen_PlayAudio_close.png')} style={styles.playAudioImg}/>
              }
            </TouchableOpacity>
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
        <View style={styles.langSelectCard}>
            <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
            <Text style={styles.langSelectText}>Chinese</Text>
            <Image source={require('../../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
            </TouchableOpacity>
            <View style={styles.langSwitchIconBox}>
            <Image source={require('../../../assets/images/Home_Translate_switch.png')} style={styles.langSwitchArrow} resizeMode='contain'/>
            </View>
            <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
            <Text style={styles.langSelectText}>English</Text>
            <Image source={require('../../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
            </TouchableOpacity>
        </View>
        {/* 唤起输入框 */}
        <TouchableOpacity style={styles.langQuickBtnNew} onPress={handleStartInput}>
            <Image source={require('../../../assets/images/SpeakerMode_Write.png')} style={styles.iconQuickLangNew}/>
        </TouchableOpacity>
        {/* 语音按钮 */}
        <TouchableOpacity style={[styles.langQuickBtnNew, {marginLeft: 10}]} onPress={handlePress('QuickLang')}>
            <Image source={require('../../../assets/images/SpeakerMode_Speak.png')} style={styles.iconQuickLangNew}/>
        </TouchableOpacity>
      </View>
      {/* 语言选择弹窗：底部弹出，高度400，方便后续自定义 */}
      <Modal
        isVisible={langModalVisible}
        onBackdropPress={() => setLangModalVisible(false)}  // 点击背景关闭
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.4}
        backdropTransitionOutTiming={0} // 避免关闭时mask闪
        style={{
          justifyContent: 'flex-end', // 让 modal 停在底部
          margin: 0, // 取消默认 margin，不然内容会上浮
        }}
      >
        <View style={styles.modalContent}>
          <Text>jshjhj</Text>
        </View>
      </Modal>
      <FullScreenLoader
        visible={loading}
        text="请稍后..."
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
            placeholder="请输入内容"
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
    paddingVertical: pageLR,
  },
  contentContainer: {
    paddingHorizontal: pageLR,
    flexGrow: 1,
  },
  contentOption: {
    flexDirection: 'row',
    paddingHorizontal: pageLR,
    paddingVertical: 16,
    alignItems: 'center',
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
    marginVertical: 14,
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
    color: '#fff',
    // color: '#85F380',
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
    color: '#fff',
    // color: '#303437',
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
  langSelectCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    borderRadius: 14,
    height: 54,
    marginRight: 16,
    // paddingVertical: 16,
    paddingHorizontal: 0,
  },
  langSelectItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelectText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 14,
    fontWeight: '500',
  },
  langSelectArrow: {
    width: 12,
    aspectRatio: 1.67,
  },
  langSwitchIconBox: {
    width: 40,
    alignItems: 'center',
  },
  langSwitchArrow: {
    width: 22,
  },
  langQuickBtnNew: {
    width: 48,
    height: 48,
    backgroundColor: '#333333',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLangNew: {
    width: 46,
    height: 46,
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
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 300,
  }
});

export default HeadphoneModeScreen;
