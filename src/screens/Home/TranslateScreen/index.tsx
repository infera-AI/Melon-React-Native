import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import LinearGradient from 'react-native-linear-gradient'; // 渐变色
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 安全区
// import EStyleSheet from 'react-native-extended-stylesheet';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { useMessageModal } from '@/contexts/MessageModalContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LangSelectCard from '@/components/LangSelectCard'
import type { Language } from '@/i18n/languages';
import { scaleSize, scaleFont } from '@/utils/scale';
import DeviceInfo from 'react-native-device-info';
import Clipboard from '@react-native-clipboard/clipboard';

import { translateText } from '@/api/translate'

import { useUserStore } from '@/store';

const { width } = Dimensions.get('window');
const pageLRPadding = 16 // 页面左右间距
const numColumns = 2;
const gutter = 12; // 每行item 的间距
const itemWidth = (width - pageLRPadding * 2 - gutter) / numColumns;

const TranslateScreen: React.FC = () => {
  const { show } = useMessageModal();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 输入框state
  const insets = useSafeAreaInsets(); // 获取安全区高度

  const { language } = useLanguage();
  const [beforeLangSelect, setBeforeLangSelect] = useState(language)
  const [afterLangSelect, setAfterLangSelect] = useState<Language>('en')

  const token = useUserStore(s => s.token);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  
  const textInputRef = useRef<TextInput>(null);

  // 占位点击事件
  const handlePress = (name: string) => async () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    if (name === 'SpeakerMode') {
      navigation.navigate('Chat')
    } else if (name === 'HeadphoneMode') {
      // @ts-ignore
      DeviceInfo.isHeadphonesConnected().then((enabled) => {
        // true or false
        console.log(enabled ? '耳机已连接' : '未连接耳机');
        if (enabled) {
          navigation.navigate('HeadphoneMode')
        } else {
          show({
            message: '请连接您的耳机'
          })
        }
      });
    } else if (name === 'ListeningMode') {
      navigation.navigate('ListeningMode')
    } else if (name === 'DocumentTranslation') {
      navigation.navigate('DocumentTranslation')
    } else if (name === 'AudioTranslation') {
      navigation.navigate('AudioTranslation')
    } else if (name === 'ImageTranslation') {
      navigation.navigate('ImageTranslation')
    } else if (name === 'OralPractice') {
      navigation.navigate('OralPractice')
    } else if (name === 'OnlineCall') {
      show({
        message: '即将上线'
      })
    }
    // setLoading(true)

    // show({
    //   message: '211212'
    // })
  };

  // 翻译按钮点击
  const translationBtnClick = () => {
    if (!inputValue) {
      show({
        message: t('translate_screen.input_no_value')
      })
      textInputRef.current?.focus();
      return
    }
    textInputRef.current?.blur()
    setLoading(true)
    translateText({
      format_type: 'text',
      source_language: beforeLangSelect,
      target_language: afterLangSelect,
      source_text: inputValue
    }).then((rsp) => {
      if (rsp?.Translated) {
        show({
          message: t('translate_screen.quick_translation_success')
        })
        setInputValue(rsp?.Translated)
        scrollRef.current?.scrollToEnd(true);
      }
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
    })
  }

  const copyText = () => {    
    Clipboard.setString(inputValue);
    show({
      message: t('translate_screen.copy_success')
    })
  }

  useEffect(() => {
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.root}>
      {/* 顶部安全区占位，防止内容被遮挡 */}
      <View style={{ height: insets.top }} />
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true} // 必须：支持 Android 滚动
        extraScrollHeight={20} // 输入框上移的高度
        enableAutomaticScroll={true} // 自动滚动
        keyboardOpeningTime={0}
      >
        {/* 头部卡片，优化渐变色 */}
        <TouchableOpacity
           onPress={handlePress('OralPractice')}
           activeOpacity={0.85}
        >
          <View style={styles.headerCard}>
            <LinearGradient
              colors={['#9CEB90', '#9CBEFD']}
              start={{ x: 0.145, y: 0.2 }}
              end={{ x: 0.18, y: 1 }}
              style={styles.linearGradientBg}
            ></LinearGradient>
            <View style={styles.headerCardContent}>
              {/* 头像 */}
              <View style={styles.avatarPlaceholder}>
                <Image
                  source={require('../../../../assets/images/Home_card_head.png')}
                  style={styles.headImg}
                  resizeMode='cover'
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Melon</Text>
                <Text style={styles.headerDesc}>{t('translate_screen.card_desc')}</Text>
              </View>
              {/* 聊天图标*/}
              <View
                style={{
                  position: 'absolute',
                  right: scaleSize(16),
                  top: scaleSize(16),
                }}
              >
                <Image source={require('../../../../assets/images/Home_Translate_Msg.png')} style={styles.chatBubbleIcon}/>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 四个主菜单 */}
        <Text style={styles.sectionTitle}>{t('translate_screen.four_menu_title')}</Text>
        <View style={styles.modeGridBox}>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('SpeakerMode')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_Voice.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>{t('translate_screen.speaker_mode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('HeadphoneMode')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_erji.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>{t('translate_screen.headPhone_mode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('ListeningMode')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_lingdang.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>{t('translate_screen.listening_mode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('OnlineCall')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_video.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>{t('translate_screen.online_call')}</Text>
          </TouchableOpacity>
        </View>

        {/* 翻译工具 */}
        <Text style={styles.sectionTitle}>{t('translate_screen.translation_tools')}</Text>
        <View style={styles.toolsRowNoBg}>
          <View style={styles.toolBtnNoBgFirst}>
            <TouchableOpacity activeOpacity={0.6} style={styles.toolBtnNoBgContent} onPress={handlePress('DocumentTranslation')}>
              <Image source={require('../../../../assets/images/Home_Teanslate_Document.png')} style={styles.iconDocNoBg}/>
              <Text style={styles.toolTextNoBg}>{t('translate_screen.document_translation')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.6} style={styles.toolBtnNoBgCenter} onPress={handlePress('AudioTranslation')}>
            <Image source={require('../../../../assets/images/Home_Teanslate_MP3.png')} style={styles.iconDocNoBg}/>
            <Text style={styles.toolTextNoBg}>{t('translate_screen.audio_translation')}</Text>
          </TouchableOpacity>
          <View style={styles.toolBtnNoBgLast}>
            <TouchableOpacity activeOpacity={0.6} style={styles.toolBtnNoBgContent} onPress={handlePress('ImageTranslation')}>
              <Image source={require('../../../../assets/images/Home_Teanslate_Image.png')} style={styles.iconDocNoBg}/>
              <Text style={styles.toolTextNoBg}>{t('translate_screen.image_translation')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 语言选择栏 */}
        <View style={styles.langSelectRow}>
          <LangSelectCard
            beforeLanguage={beforeLangSelect}
            afterLanguage={afterLangSelect}
            beforeSelectBack={(code) => {
              console.log('beforeSelectBack---', code);
              setBeforeLangSelect(code)
            }}
            afterSelectBack={(code) => {
              console.log('afterSelectBack---', code);
              setAfterLangSelect(code)
            }}
          />
          <TouchableOpacity style={styles.langQuickBtnNew} onPress={() => translationBtnClick()}>
            <Image source={require('../../../../assets/images/home_Tab_Translate_active.png')} style={styles.iconQuickLangNew}/>
          </TouchableOpacity>
        </View>

        {/* 输入框 */}
        <View style={styles.voiceInputBar}>
          <TextInput
            ref={textInputRef}
            style={styles.voiceInputTextInput}
            placeholder={t('translate_screen.quice_translation_placeholder')}
            placeholderTextColor="#B0B0B080"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            underlineColorAndroid="transparent"
            onFocus={() => {
              scrollRef.current?.scrollToFocusedInput(textInputRef.current!);
            }}
          />
          <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity onPress={copyText} style={!inputValue && styles.disabledCopy}>
              <Image source={require('../../../../assets/images/ListeningScreen_Copy.png')} style={styles.copyImg}/>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
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
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: pageLRPadding,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerCard: {
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  linearGradientBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerCardContent: {
    flex: 1,
    padding: 14,
    paddingRight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: '50%',
    backgroundColor: '#C1E3D6',
    marginRight: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headImg: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#222',
  },
  headerDesc: {
    fontSize: scaleFont(10),
    color: '#222',
    marginTop: scaleSize(6),
    lineHeight: scaleSize(18),
  },
  chatBubbleIcon: {
    width: 22,
    height: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginTop: 24,
  },
  // 主菜单左对齐
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  modeBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginRight: 24,
    paddingVertical: 10,
    paddingHorizontal: 0,
    minWidth: 140,
  },
  modeText: {
    color: '#B6F09C',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  iconSpeaker: {
    width: 50,
    height: 50,
  },
  toolsRowNoBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  toolBtnNoBgFirst: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    // backgroundColor: 'blue',
  },
  toolBtnNoBgCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    // backgroundColor: 'blue',
  },
  toolBtnNoBgLast: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
  },
  toolBtnNoBgContent: {
    flexDirection: 'column',
    alignItems: 'center',
    // backgroundColor: '#ff00ff',
  },
  toolTextNoBg: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  iconDocNoBg: {
    width: 48,
    height: 48,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#232325',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  langText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  langSwitchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B6F09C',
    marginHorizontal: 8,
  },
  langQuickBtn: {
    marginLeft: 8,
    backgroundColor: '#B6F09C',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLang: {
    width: 20,
    height: 20,
    backgroundColor: '#232325',
    borderRadius: 4,
  },
  voiceInputBar: {
    backgroundColor: '#232325',
    borderRadius: 14,
    padding: 20,
    marginTop: 14,
    marginBottom: 16,
  },
  voiceInputTextInput: {
    color: '#ccc',
    height: 100,
    fontSize: 15,
    minHeight: 40,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
  },
  disabledCopy: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  copyImg: {
    width: 20,
    height: 20,
  },
  modeGridBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  modeCard: {
    width: itemWidth,
    position: 'relative',
    overflow: 'hidden',
    // aspectRatio: 1.65,
    backgroundColor: '#262626',
    borderRadius: 12,
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: 12,
  },
  modeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeCardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    // textAlign: 'center',
    marginBottom: 2,
  },
  langSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  
  langQuickBtnNew: {
    width: 64,
    height: 64,
    backgroundColor: '#333333',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLangNew: {
    width: 32,
    height: 32,
  },
});

export default TranslateScreen;
