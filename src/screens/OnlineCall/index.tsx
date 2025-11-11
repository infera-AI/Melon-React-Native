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
  Linking
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import EStyleSheet from 'react-native-extended-stylesheet';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LangSelectCard from '@/components/LangSelectCard'
import type { Language } from '@/i18n/languages';
import { scaleSize, scaleFont, scaleIcon } from '@/utils/scale';
import { useMessageModal } from '@/contexts/MessageModalContext';
import theme from '@/utils/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  createArtcChannel
} from '@/api/translate'

import { useUserStore } from '@/store';

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



const OnlineCallScreen: React.FC = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const { show } = useMessageModal();

  const { language } = useLanguage();
  const [beforeLangSelect, setBeforeLangSelect] = useState(language)
  const [afterLangSelect, setAfterLangSelect] = useState<Language>('en')

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const [callType, setCallType] = useState(1); // 呼叫类型，1  视频    2语音

  useEffect(() => {
    
    return () => {
      
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 开始通话按钮点击
  const startCall = async() => {
    console.log('开始通话');
    try {
      setLoading(true)
      const rsp = await createArtcChannel()
      setLoading(false)
      console.log('artc-token---', rsp);
      
      if (rsp?.channel_id && rsp?.organizer && rsp?.participant) {
        const channel = rsp?.channel_id
        const organizer = rsp?.organizer // 组织者
        const participant = rsp?.participant // 参与者
        // const callType = callType === 1 ? 'video' : 'audio'
        const token = useUserStore.getState().token || useUserStore.getState().verification_token;
        let url = `https://sinobiz.biz/melonscall?before=${beforeLangSelect}&after=${afterLangSelect}&channel=${channel}&organizer=${organizer}&participant=${participant}&callType=${callType === 1 ? 'video' : 'audio'}&token=${token}`
        console.log('url--', url);
        
        Linking.openURL(url);
      } else {
        show({
          message: t('translate_screen.rsp_params_error')
        })
      }
    } catch (error) {
      setLoading(false)
      show({
        message: t('response_error')
      })
    }
    
    
  }

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text={t('translate_screen.onlinecall_pagetitle')}
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <Text style={styles.blockText}>
          {t('translate_screen.onlinecall_language_selection')}
        </Text>
        {/* 语言选择栏 */}
        <LangSelectCard
          beforeLanguage={beforeLangSelect}
          singleSelect={true}
          singleSelectLabel={t('translate_screen.onlinecall_singleSelectLang_label1')}
          beforeSelectBack={(code) => {
            console.log('beforeSelectBack---', code);
            setBeforeLangSelect(code)
          }}
        />
        <LangSelectCard
          beforeLanguage={afterLangSelect}
          singleSelect={true}
          singleSelectLabel={t('translate_screen.onlinecall_singleSelectLang_label2')}
          beforeSelectBack={(code) => {
            console.log('setAfterLangSelect---', code);
            setAfterLangSelect(code)
          }}
          style={{marginTop: scaleSize(12), marginBottom: scaleSize(20)}}
        />

        <Text style={styles.blockText}>
          {t('translate_screen.onlinecall_calltype')}
        </Text>
        <View style={styles.callTypeView}>
          <TouchableOpacity style={styles.callTypeItem} onPress={() => setCallType(1)}>
            <View style={[styles.selectRadioView, callType === 1 && styles.selectRadioViewActive]}>
              {
                callType === 1 &&
                <Text>
                  <Icon name='checkmark' size={scaleIcon(18)}/>
                </Text>
              }
            </View>
            <Text style={styles.callTypeItemText}>
              {t('translate_screen.onlinecall_calltype_video')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callTypeItem} onPress={() => setCallType(2)}>
            <View style={[styles.selectRadioView, callType === 2 && styles.selectRadioViewActive]}>
              {
                callType === 2 &&
                <Text>
                  <Icon name='checkmark' size={scaleIcon(18)}/>
                </Text>
              }
            </View>
            <Text style={styles.callTypeItemText}>
              {t('translate_screen.onlinecall_calltype_voice')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={startCall}>
          <View style={styles.callBtn}>
            <Text
              numberOfLines={1}
              ellipsizeMode='tail'
              style={{
                fontSize: 18,
                color: '#fff',
                fontWeight: '500',
                paddingHorizontal: scaleSize(10),
              }}
            >
              {t('translate_screen.go_call')}
            </Text>
          </View>
        </TouchableOpacity>

        
      </View>
      
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
        timeout={20000}
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
  content: {
    flex: 1,
    width: contentWidth,
    marginLeft: pageLR,
    paddingVertical: pageLR,
    borderRadius: 10,
    overflow: 'hidden',
  },
  blockText: {
    fontSize: scaleFont(18),
    color: '#fff',
    fontWeight: 'bold',
    marginTop: scaleSize(10),
    marginBottom: scaleSize(10)
  },
  callTypeView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(8)
  },
  callTypeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectRadioView: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: scaleSize(1),
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectRadioViewActive: {
    backgroundColor: theme.primary
  },
  callTypeItemText: {
    fontSize: scaleFont(13),
    color: '#fff',
    marginLeft: scaleSize(10)
  },
  callBtn: {
    width: '80%',
    alignSelf: 'center',
    height: scaleSize(50),
    borderRadius: scaleSize(25),
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#fff',
    borderWidth: scaleSize(1),
    marginTop: scaleSize(40),
    justifyContent: 'center',
  },
  
  disabledDom: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});

export default OnlineCallScreen;
