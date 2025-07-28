// 图片翻译页面
import React, { useState, useRef, useEffect } from 'react';
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
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Octicons';
import MaterialDesignIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import PublicModal from '@/components/PublicModal'


const { width, height } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width - pageLR * 2

const imgListColumn = 3
const gutter = 12; // 每行item 的间距
const imgItemWidth = (contentWidth - pageLR * 2 - gutter * (imgListColumn - 1)) / imgListColumn - 1;
const imgListContentHeight = imgItemWidth * 3 + gutter * 2


const contentMaxHeight = height

const UploadStatusEnum = {
  TYPE_NORMAL: 1, // 未上传
  TYPE_SUCCESS: 2, // 上传成功
  TYPE_TRANSLATING: 3, // 翻译中
  TYPE_TRANSLATION_SUCCESS: 4, // 翻译成功
}

const ImageTranslationScreen: React.FC = () => {

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
    // startProgress()
  }

  const copyBtnClick = () => {

  }

  useEffect(() => {
    // 初始化页面
    
    // 销毁页面
    return () => {
      
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text="Image Translation"
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={uploadStatus !== UploadStatusEnum.TYPE_TRANSLATION_SUCCESS}
      >
        <View style={[styles.content, uploadStatus === UploadStatusEnum.TYPE_TRANSLATION_SUCCESS && {flex: 1}]}>
          {/* 主内容----------------------------------------- */}
          {/* 未上传状态界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_NORMAL &&
            <View style={styles.uploadContent}>
              <View style={styles.fileImgView}>
                <Image
                  source={require('../../.../../../assets/images/ImageTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={styles.uploadTipText}>
                Please take photos in good lighting conditions.Album upload supports multiple selections, no more than 9 photos.
              </Text>
            </View>
          }

          {/* 上传成功界面、翻译成功界面 */}
          {
            (uploadStatus === UploadStatusEnum.TYPE_SUCCESS || uploadStatus === UploadStatusEnum.TYPE_TRANSLATING) &&
            <View style={[styles.uploadContent, {justifyContent: 'flex-start', marginTop: 'auto'}]}>
              {/* 图片列表 */}
              <View style={[styles.imgListContent, {height: imgListContentHeight}]}>
                {
                  Array(9).fill(0).map((item, index) => {
                    return <View key={index} style={styles.imgItem}/>
                  })
                }
                {/* <View style={styles.imgItem}/>
                <View style={styles.imgItem}/>
                <View style={styles.imgItem}/> */}
                
              </View>
              {/* 上传成功提示文本 */}
              <View style={{marginTop: 20, marginBottom: 40}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text>
                    <Icon name="check-circle-fill" size={17} color={'#36F279'}/>
                  </Text>
                  <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: 10}}>Upload Successful !</Text>
                </View>
              </View>
              {/* 翻译中时显示翻译进度 */}
              {
                uploadStatus === UploadStatusEnum.TYPE_TRANSLATING &&
                <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 30}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: 10}}>
                      Translating...77%
                    </Text>
                  </View>
                </View>
              }
            </View>
          }

          {/* 翻译成功界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_TRANSLATION_SUCCESS &&
            <View style={[styles.uploadContent, styles.uploadContentLast]}>
              {/* 横向滚动图片 */}
              <View style={{height: imgItemWidth}}>
                <ScrollView
                  horizontal={true}
                  contentContainerStyle={{flexGrow: 1}}
                  showsHorizontalScrollIndicator={true}
                  style={{flex: 1}}
                >
                  <View style={{ flexDirection: 'row', gap: gutter}}>
                    <View style={styles.imgItem}/>
                    <View style={styles.imgItem}/>
                    <View style={styles.imgItem}/>
                    <View style={styles.imgItem}/>
                    <View style={styles.imgItem}/>
                  </View>
                </ScrollView>
              </View>
              <View style={{flex: 1, marginTop: 16, overflow: 'hidden', position: 'relative'}}>
                <View style={{position: 'absolute', width: '100%', height: '100%', overflow: 'hidden'}}>
                  <ScrollView
                    style={{flex: 1}}
                    contentContainerStyle={{flexGrow: 1}}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.translationText}>
                      liability, and Party B agrees that Party A will directly seek compensation from Microsoft. Contract Changes and Termination Any changes or supplements to this contract must be agreed upon in writing by both parties and signed in a written agreement. 2 During the performance of the contract, if one party proposes to terminate the contract, it shall notify the other party in writing 30 days in advance: If the contract cannot be continued due to force majeure or other reasons stipulated by laws and regulations, this contract may be terminated in advance, and both parties shall not bear liability for breach of contract. Force majeure Force majeure refers to events that cannot be foreseen, avoided I, or overcome. Due to force majeure
                    </Text>
                  </ScrollView>
                </View>
              </View>
              
              {/* 复制按钮 */}
              <View style={styles.optionsView}>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyBtnClick()}>
                  <Image source={require('../../../assets/images/ListeningScreen_Copy.png')} style={styles.copyImg}/>
                </TouchableOpacity>
              </View>
            </View>
          }


          {/* 按钮---------------------------------------- */}
          {/* 未上传显示 拍照、相册上传按钮 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_NORMAL &&
            <>
              {/* 拍照上传按钮 */}
              <TouchableOpacity>
                <View style={styles.reUploadBtn}>
                  <Text style={{
                    fontSize: 18,
                    color: '#fff',
                    fontWeight: '400'
                  }}>
                    Shoot
                  </Text>
                </View>
              </TouchableOpacity>
              {/* 相册上传按钮 */}
              <TouchableOpacity onPress={selectFileBtnClick}>
                <View style={styles.uploadBtn}>
                  <Text style={{
                    fontSize: 18,
                    color: '#0c0c0dbc',
                    fontWeight: '400'
                  }}>
                    Album
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          }

          {/* 上传成功显示重新上传按钮、开始翻译按钮 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_SUCCESS &&
            // 重新上传按钮
            <TouchableOpacity>
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
        </View>
      </ScrollView>
      
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

      {/* loading */}
      <FullScreenLoader
        visible={loading}
        text="请稍后..."
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
    // paddingVertical: pageLR,
  },
  contentContainer: {
    paddingHorizontal: pageLR,
    flexGrow: 1,
  },
  content: {
    width: contentWidth,
    backgroundColor: '#262626',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    padding: pageLR,
  },
  uploadContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 46,
  },
  uploadContentLast: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 0,
  },
  translationText: {
    fontSize: 16,
    color: '#B0B0B0',
    lineHeight: 22,
  },
  fileImgView: {
    width: '56%',
    aspectRatio: 1,
    borderRadius: 56,
    backgroundColor: '#3E3E3E',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 40,
  },
  uploadBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#85F380',
    alignItems: 'center',
    marginBottom: 8,
  },
  reUploadBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderColor: '#85F380',
    borderWidth: 1,
  },
  imgListContent: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imgItem: {
    width: imgItemWidth,
    height: imgItemWidth,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'blue'
  },
  wordContent: {
    marginTop: 16,
    flex: 1,
    height: 100,
    backgroundColor: '#ff00ff',
  },
  optionsView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  copyBtn: {
    marginLeft: 60,
  },
  copyImg: {
    width: 20,
    height: 20,
  },
  langSelectRow: {
    width: contentWidth,
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
    width: 20,
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
});

export default ImageTranslationScreen;
