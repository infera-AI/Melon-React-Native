// 文档翻译页面
import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
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
import Icon from 'react-native-vector-icons/Octicons';

const { width, height } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width - pageLR * 2

const contentMaxHeight = height * 0.6

const UploadStatusEnum = {
  TYPE_NORMAL: 1, // 未上传
  TYPE_SUCCESS: 2, // 上传成功
  TYPE_TRANSLATING: 3, // 翻译中
  TYPE_TRANSLATION_SUCCESS: 4, // 翻译成功
}

const DocumentTranslationScreen: React.FC = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(UploadStatusEnum.TYPE_NORMAL);

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
    marginRight: 90,
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
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 300,
  }
});

export default DocumentTranslationScreen;
