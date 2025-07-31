/**
 * 选择说话按钮弹窗组件
 */
import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  Text
} from 'react-native';
import PublicModal from '@/components/PublicModal'
import { scaleSize, scaleFont } from '@/utils/scale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpeakBtn, { SpeakBtnRef } from '@/components/SpeakBtn'
import { StatusEnum } from '@/components/SpeakBtn';
import FullScreenLoader from '@/components/FullScreenLoader';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language, supportedLanguages } from "@/i18n/languages"

export type SelectSpeakBtnModalRef = {
  destroy: () => void;
};

type Props = {
  visible: boolean;
  beforeLanguage: string; // 主语言
  afterLanguage: string; // 翻译成什么语言
  tellResult?: (tyle: string, data: any) => void;
  resultCallBack?: (() => void) | null | undefined; // 点击背景关闭回调
  onBackdropPress?: (() => void) | null | undefined; // 点击背景关闭回调
};
const SelectSpeakBtnModal = forwardRef<SelectSpeakBtnModalRef, Props>(({
  visible = false,
  beforeLanguage = '',
  afterLanguage = '',
  tellResult = () => null,
  onBackdropPress = null,
}, ref) => {

  const { t, tCustom } = useLanguage();
  // const insets = useSafeAreaInsets(); // 获取安全区域距离
  const [loading, setLoading] = useState(false);

  const speakBtn1Ref = useRef<SpeakBtnRef>(null);
  const speakBtn2Ref = useRef<SpeakBtnRef>(null);

  const [speakBtn1IsDown, setSpeakBtn1IsDown] = useState(false)
  const [speakBtn2IsDown, setSpeakBtn2IsDown] = useState(false)

  const beforeLanguageFromCountry = supportedLanguages.find(lang => lang.code === beforeLanguage) || supportedLanguages[0];
  const afterLanguageFromCountry = supportedLanguages.find(lang => lang.code === afterLanguage) || supportedLanguages[0];

  const bgClose = () => {
    onBackdropPress && onBackdropPress()
  }
  // useEffect(() => {
  //   if (!visible) {
  //     speakBtn1Ref.current?.destroy()
  //     speakBtn2Ref.current?.destroy()
  //   }
  // }, [visible]);

  const destroy = () => {
    speakBtn1Ref.current?.destroy()
    speakBtn2Ref.current?.destroy()
  }

  useEffect(() => {
    
    return () => console.log('弹窗销毁');
    
  }, []);

  useImperativeHandle(ref, () => ({
    destroy,
  }));

  return (
    <PublicModal
      visible={visible}
      backdropOpacity={0.1}
      onBackdropPress={bgClose}
      renderContent={() => {
        return (
          <View style={styles.speakBtnModalContent}>
            {/* 主语音按钮 */}
            <SpeakBtn
              ref={speakBtn1Ref}
              beforeLanguage={beforeLanguage}
              afterLanguage={afterLanguage}
              voiceWaveBgColor={'#1d1c1cff'}
              tellResult={(data) => {
                tellResult('user', data)
                onBackdropPress && onBackdropPress()
              }}
              disabled={speakBtn2IsDown}
              isDownCallBack={(isDown) => {
                setSpeakBtn1IsDown(isDown)
              }}
              statusChange={(status) => {
                if (status === StatusEnum.TYPE_WAIT_TRANSLATION_RESULT) {
                  setLoading(true)
                } else {
                  setLoading(false)
                }
              }}
              renderContent={() => {
                return (
                  <View style={styles.btnItemView}>
                    <View style={styles.btnImgOut}>
                      <Image
                        source={require('../../assets/images/Chat_speak_btn_rect_user.png')}
                        style={styles.btnImg}
                        resizeMode={'contain'}
                      />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={[styles.btnText, styles.btnTextMy]}
                      >
                        {tCustom('translate_screen.hold_btn', beforeLanguage as Language)}
                      </Text>
                    </View>
                    <Text style={[styles.btnTipText, styles.btnTipTextMy]}>
                      {beforeLanguageFromCountry.label}
                    </Text>
                  </View>
                )
              }}
            />

            {/* 次语音按钮 */}
            <SpeakBtn
              ref={speakBtn2Ref}
              // beforeLanguage={afterLanguage}
              // afterLanguage={beforeLanguage}
              beforeLanguage={beforeLanguage}
              afterLanguage={afterLanguage}
              voiceWaveBgColor={'#1d1c1cff'}
              disabled={speakBtn1IsDown}
              isDownCallBack={(isDown) => {
                setSpeakBtn2IsDown(isDown)
              }}
              tellResult={(data) => {
                tellResult('other', data)
                onBackdropPress && onBackdropPress()
              }}
              statusChange={(status) => {
                if (status === StatusEnum.TYPE_WAIT_TRANSLATION_RESULT) {
                  setLoading(true)
                } else {
                  setLoading(false)
                }
              }}
              
              renderContent={() => {
                return (
                  <View style={styles.btnItemView}>
                    <View style={styles.btnImgOut}>
                      <Image
                        source={require('../../assets/images/Chat_speak_btn_rect_other.png')}
                        style={styles.btnImg}
                        resizeMode={'contain'}
                      />
                      <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={[styles.btnText, styles.btnTextOther]}
                      >
                        {tCustom('translate_screen.hold_btn', afterLanguage as Language)}
                      </Text>
                    </View>
                    <Text style={[styles.btnTipText, styles.btnTipTextOther]}>
                      {afterLanguageFromCountry.label}
                    </Text>
                  </View>
                )
              }}

            />
            <FullScreenLoader
              visible={loading}
              text={t('translate_screen.loading_text')}
              timeout={20000}
              onTimeout={() => setLoading(false)}
            />
          </View>
        )
      }}
    />
  )
})

const styles = StyleSheet.create({
   speakBtnModalContent: {
    borderTopLeftRadius: scaleSize(10),
    borderTopRightRadius: scaleSize(10),
    height: scaleSize(240),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262626',
    gap: scaleSize(40),
  },
  btnItemView: {
    alignItems: 'center',
  },
  btnImgOut: {
    width: scaleSize(120),
    // paddingHorizontal: scaleSize(6),
    aspectRatio: 1.77,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  btnImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  btnText: {
    paddingHorizontal: scaleSize(6),
    fontSize: scaleFont(13),
    fontWeight: 500
  },
  btnTipText: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    marginTop: scaleSize(10),
  },
  btnTextMy: {
    color: '#85F380'
  },
  btnTipTextMy: {
    color: '#85F380',
  },
  btnTextOther: {
    color: '#7DC3FF'
  },
  btnTipTextOther: {
    color: '#7DC3FF',
  }
})

export default SelectSpeakBtnModal;