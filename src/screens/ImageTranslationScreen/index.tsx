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
  PermissionsAndroid,
  Platform
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialDesignIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMessageModal } from '@/contexts/MessageModalContext';

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import type { Language } from '@/i18n/languages';
import LangSelectCard from '@/components/LangSelectCard'

import PublicModal from '@/components/PublicModal'
import { scaleFont, scaleSize } from '@/utils/scale';

import Clipboard from '@react-native-clipboard/clipboard';

import {
  translateImage
} from '@/api/translate'


const { width, height } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width - pageLR * 2

const imgListColumn = 3
const gutter = 12; // 每行item 的间距
const imgItemWidth = (contentWidth - pageLR * 2 - gutter * (imgListColumn - 1)) / imgListColumn - 1;
const imgListContentHeight = imgItemWidth * 3 + gutter * 2


const contentMaxHeight = height

const MAX_UPLOAD_IMG_COUNT = 9

const TRANSLATION_MAX_TIME = 60000 // 翻译任务最大时长 (1分钟)，伪进度

const UploadStatusEnum = {
  TYPE_NORMAL: 1, // 未上传
  TYPE_SUCCESS: 2, // 上传成功
  TYPE_TRANSLATING: 3, // 翻译中
  TYPE_TRANSLATION_SUCCESS: 4, // 翻译成功
}

let getTaskInfoTimer:any = null

const ImageTranslationScreen: React.FC = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const { show } = useMessageModal();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(UploadStatusEnum.TYPE_NORMAL);

  const [cameraType, setCameraType] = useState('') // shoot  拍照   album 相册

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const [imgList, setImgList] = useState<any>([])

  const { language } = useLanguage();

  const [beforeLangSelect, setBeforeLangSelect] = useState(language)
  const [afterLangSelect, setAfterLangSelect] = useState<Language>('en')
  
  const createTaskTime = useRef(0)
  const [translatedResult, setTranslatedResult] = useState<any>('')

  const [translationProgress, setTranslationProgress] = useState(0)

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  async function requestCameraPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: t('translate_screen.camera_permission_title'),
          message: t('translate_screen.camera_permission_desc'),
          buttonPositive: t('translate_screen.camera_permission_ok'),
          buttonNegative: t('translate_screen.camera_permission_no'),
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const startTranslationBtnClick = () => {
    setUploadStatus(UploadStatusEnum.TYPE_TRANSLATING)
    createTaskTime.current = Math.floor(performance.now())
    getTaskInfo()
    // setLoading(true)
    const arr = imgList.map((item: string, index: number) => {
      return {
        uri: item,
        name: `${Math.floor(performance.now())}-${index}`,
        type: item.split(/\.(?=[^\.]+$)/)[1]
      }
    })
    console.log('arr----', arr);
    
    translateImage({
      source_language: beforeLangSelect,
      target_language: afterLangSelect,
      img_files: arr
    }).then((rsp) => {
      console.log('rsp------', rsp);
      setTranslatedResult(rsp?.result)
      setTranslationProgress(100)
      setTimeout(() => {
        setUploadStatus(UploadStatusEnum.TYPE_TRANSLATION_SUCCESS)
      }, 1000)
    }).catch((err) => {
      console.error('翻译失败', err);
      cancelTranslationBtnClick()
      show({
        message: t('translate_screen.translation_fail')
      })
    })  
  }

  const getTaskInfo = () => {
    getTaskInfoTimer = setTimeout(() => {
      let percent = toPercent(Math.floor(performance.now()) - createTaskTime.current)
      setTranslationProgress(percent === 100 ? 99 : percent)
    }, 3000)
  }

  const toPercent = (num: number) => {
    const percent = (num / TRANSLATION_MAX_TIME) * 100;
    return Math.min(Math.round(percent), 100); // 四舍五入并确保最大值为 100
  }

  const cancelTranslationBtnClick = () => {
    setUploadStatus(UploadStatusEnum.TYPE_NORMAL)
    createTaskTime.current = 0
    setTranslatedResult('')
    clearTimeout(getTaskInfoTimer)
    setImgList([])
    setCameraType('')
    setTranslationProgress(0)
    // startProgress()
  }

  // 拍照
  const takePhoto = async () => {
    if (Platform.OS === 'android') {
      const granted = await requestCameraPermission();
      if (!granted) {
        console.log('权限不足, 您未授权相机权限');
        show({
          message: t('translate_screen.no_camera_permission')
        })
        return;
      }
    }
    const result = await launchCamera({
      mediaType: 'photo',     // 拍照
      saveToPhotos: false,     // 是否保存到相册
      includeBase64: false,   // 是否返回 base64
      cameraType: 'back',     // back 或 front
    });

    if (result.didCancel) {
      console.log('用户取消拍照');
    } else if (result.errorCode) {
      console.log('出错了:', result.errorMessage);
    } else {
      const asset = result.assets?.[0];
      if (asset?.uri) {
        console.log('拍到的图片 URI:', asset.uri);
        setCameraType('shoot')
        setImgList([
          ...imgList,
          asset.uri
        ])
        setUploadStatus(UploadStatusEnum.TYPE_SUCCESS)
        // 可用于上传或 Image 组件展示
      }
    }
  };

  // 相册
  const pickImageFromGallery = async () => {
    let count = MAX_UPLOAD_IMG_COUNT - (imgList?.length || 0)
    
    const result = await launchImageLibrary({
      mediaType: 'photo',     // 只选图片，若要支持视频用 'mixed'
      selectionLimit: count,      // 只选一张
      includeBase64: false,   // 如需 base64 设置为 true
    });

    if (result.didCancel) {
      console.log('用户取消选择');
    } else if (result.errorCode) {
      console.log('出错了:', result.errorMessage);
    } else {
      console.log('result.assets---', result.assets);
      if (result.assets?.length) {
        if ((result.assets?.length || 0) + (imgList?.length || 0) > MAX_UPLOAD_IMG_COUNT) {
          show({
            message: t('translate_screen.select_img_max_count')
          })
          return
        }
        setCameraType('album')
        const arr  = result.assets.map((item) => item.uri)
        setImgList((oldVal: any) => {
          return [
            ...oldVal,
            ...arr
          ]
        })
        setUploadStatus(UploadStatusEnum.TYPE_SUCCESS)
      }
    }
  };

  const reUploadBtnClick = () => {
    setUploadStatus(UploadStatusEnum.TYPE_NORMAL)
    setCameraType('')
    setImgList([])
  }

  const copyText = () => {
    if (!translatedResult) {
      show({
        message: t('translate_screen.no_listen_result')
      })
      return
    }
    Clipboard.setString(translatedResult);
    show({
      message: t('translate_screen.copy_success')
    })
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
        text={t('translate_screen.image_page_title')}
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
                {t('translate_screen.image_upload_tip')}
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
                  cameraType === 'shoot' ?
                  <View style={{width: '100%', height: '100%', borderRadius: 10}}>
                    <Image
                      source={{uri: imgList[0]}}
                      style={{width: '100%', height: '100%'}}
                      resizeMode={'contain'}
                    />
                  </View>
                  :
                  <>
                    {
                      imgList.map((item: any, index: number) => {
                        return (
                          <View key={index} style={styles.imgItem}>
                            <Image
                              source={{uri: item}}
                              style={{width: '100%', height: '100%'}}
                              resizeMode={'cover'}
                            />
                          </View>
                        )
                      })
                    }
                    {
                      imgList?.length < MAX_UPLOAD_IMG_COUNT &&
                      (uploadStatus === UploadStatusEnum.TYPE_NORMAL ||
                      uploadStatus === UploadStatusEnum.TYPE_SUCCESS) &&
                      <TouchableOpacity onPress={pickImageFromGallery}>
                        <View style={[styles.imgItem, styles.addItem]}>
                          <Text>
                            <Ionicons name='add-outline' size={scaleFont(50)} color={'#4e4c4cff'}/>
                          </Text>
                        </View>
                      </TouchableOpacity>
                    }
                  </>
                }
                
                
              </View>
              {/* 上传成功提示文本 */}
              <View style={{marginTop: 20, marginBottom: 40, opacity: 0}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text>
                    <Icon name="check-circle-fill" size={17} color={'#36F279'}/>
                  </Text>
                  <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: 10}}>{t('translate_screen.document_upload_success')} !</Text>
                </View>
              </View>
              {/* 翻译中时显示翻译进度 */}
              {
                uploadStatus === UploadStatusEnum.TYPE_TRANSLATING &&
                <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 30}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: translationProgress ? 10 : 0}}>
                      {t('translate_screen.document_translating')}{translationProgress ? `...${translationProgress}%` : ''}
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
                    {
                      imgList.map((item: any, index: number) => {
                        return (
                          <View key={index} style={styles.imgItem}>
                            <Image
                              source={{uri: item}}
                              style={{width: '100%', height: '100%'}}
                              resizeMode={'cover'}
                            />
                          </View>
                        )
                      })
                    }
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
                      {translatedResult}
                    </Text>
                  </ScrollView>
                </View>
              </View>
              
              {/* 复制按钮 */}
              <View style={styles.optionsView}>
                <TouchableOpacity style={styles.copyBtn} onPress={copyText}>
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
              <TouchableOpacity onPress={takePhoto}>
                <View style={styles.reUploadBtn}>
                  <Text style={{
                    fontSize: 18,
                    color: '#fff',
                    fontWeight: '400'
                  }}>
                    {t('translate_screen.image_shoot')}
                  </Text>
                </View>
              </TouchableOpacity>
              {/* 相册上传按钮 */}
              <TouchableOpacity onPress={pickImageFromGallery}>
                <View style={styles.uploadBtn}>
                  <Text style={{
                    fontSize: 18,
                    color: '#0c0c0dbc',
                    fontWeight: '400'
                  }}>
                    {t('translate_screen.image_album')}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          }

          {/* 上传成功显示重新上传按钮、开始翻译按钮 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_SUCCESS &&
            // 重新上传按钮
            <TouchableOpacity
              onPress={reUploadBtnClick}
            >
              <View style={styles.reUploadBtn}>
                <Text style={{
                  fontSize: 18,
                  color: '#fff',
                  fontWeight: '400'
                }}>
                  {t('translate_screen.document_cancel')}
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
                  {t('translate_screen.document_start_translated')}
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
                  {t('translate_screen.document_cancel')}
                </Text>
              </View>
            </TouchableOpacity>
          }
        </View>

        {/* 语言选择栏 */}
        {
          (uploadStatus === UploadStatusEnum.TYPE_NORMAL ||
          uploadStatus === UploadStatusEnum.TYPE_SUCCESS) ?
            <View style={styles.langSelectRow}>
              <LangSelectCard
                beforeLanguage={beforeLangSelect}
                afterLanguage={afterLangSelect}
                paddingTopBottom={0}
                textSize={12}
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
            </View>
            :
            <View style={{height: scaleSize(40)}}/>
        }
      </ScrollView>

      {/* loading */}
      <FullScreenLoader
        visible={loading}
        text={t('translate_screen.loading_text')}
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
  },
  addItem: {
    backgroundColor: '#343333ff',
    alignItems: 'center',
    justifyContent: 'center'
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
});

export default ImageTranslationScreen;
