// 文档翻译页面
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Animated
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import EStyleSheet from 'react-native-extended-stylesheet';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Octicons';
import MaterialDesignIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PublicModal from '@/components/PublicModal'

const { width, height } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width - pageLR * 2

const contentMaxHeight = height * 0.7

const downloadModalHeight = height * 0.4

const UploadStatusEnum = {
  TYPE_NORMAL: 1, // 未上传
  TYPE_SUCCESS: 2, // 上传成功
  TYPE_TRANSLATING: 3, // 翻译中
  TYPE_TRANSLATION_SUCCESS: 4, // 翻译成功
}

const OriginalSwitchEnum = {
  TYPE_ORIGINAL: 'original', // 原文
  TYPE_TRANSLATION: 'translation', // 译文
}

const DocumentTranslationScreen: React.FC = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(UploadStatusEnum.TYPE_NORMAL);

  const [originalSwitch, setOriginalSwitch] = useState(OriginalSwitchEnum.TYPE_ORIGINAL);

  const [downloadModalShow, setDownloadModalShow] = useState(false)

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  const selectFileBtnClick = () => {
    setUploadStatus(UploadStatusEnum.TYPE_SUCCESS)
  }
  const startTranslationBtnClick = () => {
    setUploadStatus(UploadStatusEnum.TYPE_TRANSLATING)
  }
  const cancelTranslationBtnClick = () => {
    // setUploadStatus(UploadStatusEnum.TYPE_NORMAL)
    setUploadStatus(UploadStatusEnum.TYPE_TRANSLATION_SUCCESS)
  }

  const originalSwitchChange = (type: string) => () => {
    setOriginalSwitch(type)
  }

  const wordDownloadBtnAnim = useRef(new Animated.Value(0)).current; // 初始为 0
  const pdfDownloadBtnAnim = useRef(new Animated.Value(0)).current; // 初始为 0

  const wordBorderColor = wordDownloadBtnAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#85F380'], // 未按下 → 按下，改成你要的颜色
  });

  const pdfBorderColor = pdfDownloadBtnAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#85F380'], // 未按下 → 按下，改成你要的颜色
  });

  const wordBtnPressIn = (type: string) => {
    Animated.timing(type === 'word' ? wordDownloadBtnAnim : pdfDownloadBtnAnim, {
      toValue: 1, // 缩小一点
      duration: 100,
      useNativeDriver: false,
    }).start(() => {
     
    });
  }
  const wordBtnPressOut = (type: string) => {
    setTimeout(() => {
      Animated.timing(type === 'word' ? wordDownloadBtnAnim : pdfDownloadBtnAnim, {
        toValue: 0, // 缩小一点
        useNativeDriver: false,
      }).start();
    }, 100)
    
  }

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text="Document Translation"
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <View style={[styles.content, uploadStatus === UploadStatusEnum.TYPE_TRANSLATION_SUCCESS ? {maxHeight: 'auto'}: {}]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 主内容----------------------------------------- */}
          {/* 未上传状态界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_NORMAL &&
            <View style={styles.uploadContent}>
              <View style={styles.fileImgView}>
                <Image
                  source={require('../../.../../../assets/images/DocumentTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={styles.uploadTipText}>
                {`Supports formats like doc/pdf/xls/ppt\n(within 100M)`}
              </Text>
            </View>
          }

          {/* 上传成功界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_SUCCESS &&
            <View style={[styles.uploadContent, {justifyContent: 'flex-start'}]}>
              <View style={[styles.fileImgView, styles.fileImgViewSmall]}>
                <Image
                  source={require('../../.../../../assets/images/DocumentTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={[styles.uploadTipText, { marginTop: 24 }]}>
                {`Cloud Virtual Machine Rental Contract\n(Template).docx`}
              </Text>
              <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 40}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text>
                    <Icon name="check-circle-fill" size={17} color={'#36F279'}/>
                  </Text>
                  <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: 10}}>Upload Successful !</Text>
                </View>
              </View>
            </View>
          }
          {/* 翻译中界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_TRANSLATING &&
            <View style={[styles.uploadContent, {justifyContent: 'flex-start'}]}>
              <View style={[styles.fileImgView, styles.fileImgViewSmall]}>
                <Image
                  source={require('../../.../../../assets/images/DocumentTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={[styles.uploadTipText, { marginTop: 24 }]}>
                {`Cloud Virtual Machine Rental Contract\n(Template).docx`}
              </Text>
              <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 40}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: 10}}>
                    Translating...77%
                  </Text>
                </View>
              </View>
            </View>
          }
          {/* 翻译成功界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_TRANSLATION_SUCCESS &&
            <View style={[styles.uploadContent, {justifyContent: 'flex-start'}]}>
              <View style={styles.titleView}>
                <Text style={styles.titleViewText}>
                  {`Cloud Virtual Machine Rental Contract\n(Template).docx`}
                </Text>
              </View>
              <View style={styles.wordContent}>
                <Text style={styles.wordContentText}>
                  liability, and Party B agrees that Party A will directly seek compensation from Microsoft. Contract Changes and Termination Any changes or supplements to this contract must be agreed upon in writing by both parties and signed in a written agreement. 2 During the performance of the contract, if one party proposes to terminate the contract, it shall notify the other party in writing 30 days in advance: If the contract cannot be continued due to force majeure or other reasons stipulated by laws and regulations, this contract may be terminated in advance, and both parties shall not bear liability for breach of contract. Force majeure Force majeure refers to events that cannot be foreseen, avoided, or overcome. Due to force majeure
                </Text>
              </View>
            </View>
          }


          {/* 按钮---------------------------------------- */}
          {/* 未上传显示上传按钮 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_NORMAL &&
            <TouchableOpacity onPress={selectFileBtnClick}>
              <View style={styles.uploadBtn}>
                <Text style={{
                  fontSize: 18,
                  color: '#0c0c0dbc',
                  fontWeight: '400'
                }}>
                  Upload Document
                </Text>
              </View>
            </TouchableOpacity>
          }

          {/* 上传成功显示重新上传按钮、开始翻译按钮 */}
          {/* 重新上传按钮 */}
          {
            (uploadStatus === UploadStatusEnum.TYPE_SUCCESS || uploadStatus === UploadStatusEnum.TYPE_TRANSLATING) &&
            <TouchableOpacity
              style={{
                opacity: uploadStatus === UploadStatusEnum.TYPE_SUCCESS ? 1 : 0,
                pointerEvents: uploadStatus === UploadStatusEnum.TYPE_TRANSLATING ? 'none' : 'auto'
              }}
            >
              <View style={styles.reUploadBtn}>
                <Text style={{
                  fontSize: 18,
                  color: '#fff',
                  fontWeight: '400'
                }}>
                  Re-upload
                </Text>
              </View>
            </TouchableOpacity>
          }
          {/* 开始翻译按钮 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_SUCCESS &&
            <TouchableOpacity onPress={startTranslationBtnClick}>
              <View style={styles.uploadBtn}>
                <Text style={{
                  fontSize: 18,
                  color: '#0c0c0dbc',
                  fontWeight: '400'
                }}>
                  Start Translation
                </Text>
              </View>
            </TouchableOpacity>
          }

          {/* 翻译中显示取消按钮 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_TRANSLATING &&
            <TouchableOpacity onPress={cancelTranslationBtnClick}>
              <View style={styles.uploadBtn}>
                <Text style={{
                  fontSize: 18,
                  color: '#0c0c0dbc',
                  fontWeight: '400'
                }}>
                  Cancel
                </Text>
              </View>
            </TouchableOpacity>
          }
        </ScrollView>

        {/* 翻译成功状态--按钮操作区域 */}
        {
          uploadStatus === UploadStatusEnum.TYPE_TRANSLATION_SUCCESS &&
          <View style={styles.optionsView}>
            <View style={styles.switchView}>
              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  originalSwitch === OriginalSwitchEnum.TYPE_ORIGINAL ? styles.switchBtnActive : {}
                ]}
                onPress={originalSwitchChange(OriginalSwitchEnum.TYPE_ORIGINAL)}
              >
                <Text style={styles.switchBtnText}>
                  Original text
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.switchBtn,
                  originalSwitch === OriginalSwitchEnum.TYPE_TRANSLATION ? styles.switchBtnActive : {}
                ]}
                onPress={originalSwitchChange(OriginalSwitchEnum.TYPE_TRANSLATION)}
              >
                <Text style={styles.switchBtnText}>
                  Translation
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.pageNumText}>
              3/4
            </Text>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => setDownloadModalShow(true)}>
              <Text>
                <MaterialDesignIcon name="arrow-collapse-down" size={22} color={'#ffffff'}/>
              </Text>
            </TouchableOpacity>
          </View>
        }
      </View>


      {/* 语言选择栏 */}
      {
        uploadStatus !== UploadStatusEnum.TYPE_TRANSLATION_SUCCESS &&
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
        </View>
      }
      
      {/* 语言选择弹窗：底部弹出，高度400，方便后续自定义 */}
      <PublicModal
        visible={langModalVisible}
        onBackdropPress={() => setLangModalVisible(false)}
        renderContent={() => {
          return (
            <View style={styles.modalContent}>
              <Text>jshjhj</Text>
            </View>
          )
        }}
      />

      {/* 下载弹窗 */}
      <PublicModal
        visible={downloadModalShow}
        onBackdropPress={() => setDownloadModalShow(false)}
        renderContent={() => {
          return (
            <View style={[
              styles.downloadModalContent,
              {paddingBottom: insets.bottom ? insets.bottom : 16}
            ]}>
              <View style={styles.modalTitle}>
                <View style={styles.textView}>
                  <Text
                    style={styles.titleText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Choose Download Format
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDownloadModalShow(false)}>
                  <Text>
                    <Ionicons name='close-outline' size={28} color={'#ffffff'}/>
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalCenterView}>
                <TouchableWithoutFeedback
                  onPressIn={() => wordBtnPressIn('word')}
                  onPressOut={() => wordBtnPressOut('word')}
                >
                  <Animated.View
                    style={[
                      styles.fileTypeBtn,
                      {
                        borderColor: wordBorderColor
                      }
                    ]}
                  >
                    <Image
                      source={require('../../../assets/images/File_Type_Word.png')}
                      resizeMode='contain'
                      style={styles.fileTypeImg}
                    />
                  </Animated.View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  onPressIn={() => wordBtnPressIn('pdf')}
                  onPressOut={() => wordBtnPressOut('pdf')}
                >
                  <Animated.View
                    style={[
                      styles.fileTypeBtn,
                      {
                        borderColor: pdfBorderColor
                      }
                    ]}
                  >
                    <Image
                      source={require('../../../assets/images/File_Type_Pdf.png')}
                      resizeMode='contain'
                      style={styles.fileTypeImg}
                    />
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
              <View style={styles.btnsView}>
                <TouchableOpacity
                  style={[styles.modalBottomBtn]}
                  onPress={() => setDownloadModalShow(false)}
                >
                  <Text style={styles.modalBottomBtnText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBottomBtn, styles.modalBottomBtnGreen]}
                >
                  <Text style={[styles.modalBottomBtnText, styles.modalBottomBtnText2]}>
                    Download
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />

      {/* loading */}
      <FullScreenLoader
        visible={loading}
        text="请稍后..."
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
  content: {
    flex: 1,
    maxHeight: contentMaxHeight,
    width: contentWidth,
    marginLeft: pageLR,
    backgroundColor: '#262626',
    borderRadius: 10,
    overflow: 'hidden',
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
  uploadContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileImgView: {
    width: '56%',
    aspectRatio: 1,
    borderRadius: 56,
    backgroundColor: '#3E3E3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileImgViewSmall: {
    width: 100,
    borderRadius: 20,
    marginTop: 60,
  },
  fileImg: {
    width: '84%',
    height: '84%',
  },
  uploadTipText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 30,
  },
  uploadBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#85F380',
    alignItems: 'center',
    marginBottom: 20,
  },
  reUploadBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#85F380',
    borderWidth: 1,
  },
  titleView: {
    marginTop: 20,
  },
  titleViewText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  wordContent: {
    marginTop: 20,
  },
  wordContentText: {
    color: '#B0B0B0',
    fontSize: 16,
    lineHeight: 24,
  },
  optionsView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  switchView: {
    backgroundColor: '#181819',
    borderRadius: 10,
    padding: 6,
    flex: 1,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  switchBtnActive: {
    backgroundColor: '#ffffff37',
  },
  switchBtnText: {
    color: '#fff',
    fontSize: 14,
  },
  pageNumText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  downloadBtn: {
    marginLeft: 10,
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
    marginRight: 90,
    paddingVertical: 2,
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
    fontSize: 14,
    marginRight: 8,
    fontWeight: '500',
  },
  langSelectArrow: {
    width: 10,
    aspectRatio: 1.67,
  },
  langSwitchIconBox: {
    width: 'auto',
    alignItems: 'center',
  },
  langSwitchArrow: {
    width: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 300,
  },
  downloadModalContent: {
    backgroundColor: '#262626',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: downloadModalHeight,
  },
  modalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textView: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 18,
    color: '#ffffff',
  },
  modalCenterView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  fileTypeBtn: {
    backgroundColor: '#3E3E3E',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderWidth: 1,
  },
  fileTypeImg: {
    width: '60%',
  },
  btnsView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16
  },
  modalBottomBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#333333'
  },
  modalBottomBtnGreen: {
    backgroundColor: '#85F380'
  },
  modalBottomBtnText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff'
  },
  modalBottomBtnText2: {
    color: '#262626'
  },
});

export default DocumentTranslationScreen;
