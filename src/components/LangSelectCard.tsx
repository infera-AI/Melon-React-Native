// 语言选择组件
/**
 * 使用示例
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import PublicModal from '@/components/PublicModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scaleSize, scaleFont } from '@/utils/scale';
import { languageToCountryCode, supportedLanguages } from '@/i18n/languages';
import type { LanguageOption, Language } from '@/i18n/languages';
import { useLanguage } from '@/contexts/LanguageContext';
import CountryFlag from 'react-native-country-flag';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

type Props = {
  beforeLanguage?: string; // 主语言
  afterLanguage?: string; // 翻译成什么语言
  textSize?: number,
  paddingTopBottom?: number,
  marginRight?: number,
  // backgroundColor?: string;
  // spinnerSize?: 'small' | 'large';
  // customIndicator?: React.ReactNode;
  // timeout?: number;
  beforeSelectBack?: (code: Language) => void; // 主语言选择回调
  afterSelectBack?: (code: Language) => void; // 目标语言选择回调
  // progress?: number;
};

const { height } = Dimensions.get('window');

const modalHeight = height * 0.4

const pageLR = 16;

const LangSelectCard: React.FC<Props> = ({
  beforeLanguage = 'en',
  afterLanguage = 'en',
  textSize = 14,
  paddingTopBottom = 8,
  marginRight = 20,
  beforeSelectBack = null,
  afterSelectBack = null
}) => {
  const { t } = useLanguage()
  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const [langModalVisible, setLangModalVisible] = useState(false);

  const [selectType, setSelectType] = useState('')

  const closeModalFun = () => {
    setLangModalVisible(false)
  }

  const openSelectLang = (type: string) => {
    setSelectType(type)
    setLangModalVisible(true)
  }

  const langItemClick = (item: LanguageOption) => {
    console.log('item----', item);
    if (selectType === 'before') {
      beforeSelectBack && beforeSelectBack(item.code)
    } else {
      afterSelectBack && afterSelectBack(item.code)
    }
    setLangModalVisible(false)
    
  }

  useEffect(() => {
    
  }, []);

  return (
    <>
      <View style={[styles.langSelectCard, {paddingVertical: scaleSize(paddingTopBottom), marginRight: scaleSize(marginRight),}]}>
        <TouchableOpacity style={styles.langSelectItem} onPress={() => openSelectLang('before')}>
          <View style={styles.langSelectTextView}>
            <Text style={[styles.langSelectText, {fontSize: scaleFont(textSize)}]} numberOfLines={1} ellipsizeMode={'tail'}>
              {beforeLanguage ? t(`languageNames.${beforeLanguage}`) : ''}
            </Text>
            <Image source={require('../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
          </View>
        </TouchableOpacity>
        <View style={styles.langSwitchIconBox}>
          <Image source={require('../../assets/images/Home_Translate_switch.png')} style={styles.langSwitchArrow} resizeMode='contain'/>
        </View>
        <TouchableOpacity style={styles.langSelectItem} onPress={() => openSelectLang('after')}>
          <View style={styles.langSelectTextView}>
            <Text style={[styles.langSelectText, {fontSize: scaleFont(textSize)}]} numberOfLines={1} ellipsizeMode={'tail'}>
              {afterLanguage ? t(`languageNames.${afterLanguage}`) : ''}
            </Text>
            <Image source={require('../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
          </View>
        </TouchableOpacity>
      </View>
      {/* 语言选择弹窗：底部弹出，高度400，方便后续自定义 */}
      <PublicModal
        visible={langModalVisible}
        onBackdropPress={() => closeModalFun()}
        renderContent={() => {
          return (
            <View
              style={[
                styles.modalContent,
                {paddingBottom: insets.bottom ? insets.bottom : 16}
              ]}
            >
              <View style={styles.modalTitle}>
                <View style={styles.textView}>
                  <Text
                    style={styles.titleText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Language Selection
                  </Text>
                </View>
                <TouchableOpacity onPress={() => closeModalFun()}>
                  <Text>
                    <Ionicons name='close-outline' size={scaleFont(24)} color={'#ffffff'}/>
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContentView}>
                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={styles.contentContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  {
                    supportedLanguages.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => langItemClick(item)}
                          >
                            <View style={styles.itemView}>
                              <View style={styles.countImg}>
                                <CountryFlag
                                  isoCode={languageToCountryCode[item.code]}
                                  size={25}
                                  style={styles.countryFlagIcon}
                                />
                              </View>
                              <View style={styles.languageTextView}>
                                <Text
                                  style={styles.languageText}
                                  numberOfLines={1}
                                  ellipsizeMode={'tail'}
                                >
                                  {t(`languageNames.${item.code}`)}
                                </Text>
                              </View>
                              {
                                ((selectType === 'before' && beforeLanguage === item.code) || (selectType === 'after' && afterLanguage === item.code)) &&
                                <Text>
                                  <FontAwesome6 name='check' size={scaleFont(16)} color={'#85F380'}/>
                                </Text>
                              }
                              
                            </View>
                          </TouchableOpacity>
                          {
                            index !== supportedLanguages.length - 1 &&
                            <View style={styles.itemLine}/>
                          }
                        </React.Fragment>
                      )
                    })
                  }
                </ScrollView>
              </View>
            </View>
          )
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  langSelectCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    borderRadius: scaleSize(14),
    // height: scaleSize(64),
    paddingHorizontal: scaleSize(16),
  },
  langSelectItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelectTextView: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  langSelectText: {
    color: '#fff',
    flexShrink: 1,
    flexGrow: 0,
    minWidth: 0,
  },
  langSelectArrow: {
    width: scaleSize(10),
    aspectRatio: 1.67,
    marginLeft: scaleSize(8)
  },
  langSwitchIconBox: {
    width: 'auto',
    marginHorizontal: scaleSize(14),
    alignItems: 'center',
  },
  langSwitchArrow: {
    width: scaleSize(17),
  },
  modalContent: {
    backgroundColor: '#262626',
    borderTopLeftRadius: scaleSize(10),
    borderTopRightRadius: scaleSize(10),
    height: modalHeight,
  },
  modalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
  },
  textView: {
    flex: 1,
    marginRight: scaleSize(10),
  },
  titleText: {
    fontSize: scaleFont(15),
    color: '#ffffff',
  },
  modalContentView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: pageLR,
    flexGrow: 1,
  },
  itemView: {
    paddingVertical: scaleSize(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLine: {
    height: scaleSize(1),
    backgroundColor: '#b0b0b025',
  },
  countImg: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: '50%',
    overflow: 'hidden',
  },
  countryFlagIcon: {
    width: '100%',
    height: '100%'
  },
  languageTextView: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    paddingRight: 4
  },
  languageText: {
    width: '100%',
    fontSize: scaleFont(14),
    color: '#ffffff',
    marginLeft: scaleSize(10),
  },
});

export default LangSelectCard;
