// 音频翻译页面
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Animated,
  Platform,
  PermissionsAndroid
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
import { useMessageModal } from '@/contexts/MessageModalContext';
import type { Language } from '@/i18n/languages';
import LangSelectCard from '@/components/LangSelectCard'

import { NativeModules} from 'react-native';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import {
  translateAudio,
  getTranslationAudioTask
} from '@/api/translate/translate'

import { pick, FileToCopy, keepLocalCopy } from '@react-native-documents/picker';

import PublicModal from '@/components/PublicModal'

import ProgressBar from '@/components/ProgressBar';

import { AudioPlayerController } from '@/utils/AudioPlayerController';

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

const MAX_FILE_SIZE_MB = 100; // 文件大小限制（M）

const TRANSLATION_MAX_TIME = 60000 // 翻译任务最大时长 (1分钟)，伪进度

const iosTypes = [
  'public.audio',     // 通用音频类型（兜底）
  'audio/*',          // 通用音频 MIME 类型（兜底未匹配到的类型）

  'public.mp3',       // MP3
  'audio/mpeg',       // MP3 MIME 类型（实际返回的类型）

  'audio/vnd.wave',   // WAV（iOS 标准 MIME 类型，也支持 UTType：com.microsoft.waveform-audio）
  'com.microsoft.waveform-audio', // WAV UTType（替代旧的 public.wav）
  'public.wav',

  // 4. 其他格式（同上，MIME + UTType）
  'audio/mp4',        // MP4 MIME 类型
  'public.mpeg-4-audio', // MP4 UTType

  'public.m4a-audio', // M4A（iOS 标准 UTType，替代旧的 public.m4a）
  'audio/x-m4a',      // M4A MIME 类型

  'public.aac-audio', // AAC（iOS 标准 UTType，替代旧的 public.aac）
  'audio/aac',        // AAC MIME 类型

  'public.ogg-audio', // OGG（iOS 标准 UTType，替代旧的 public.ogg）
  'audio/ogg',        // OGG MIME 类型

  'public.flac-audio',// FLAC（iOS 标准 UTType，替代旧的 public.flac）
  'audio/flac',       // FLAC MIME 类型
];

const androidTypes = [
  'audio/mpeg',       // MP3
  'audio/x-wav',      // WAV（Android 标准 MIME 类型）
  'audio/wav',     // wav
  'audio/mp4',        // MP4
  'audio/aac',        // AAC
  'audio/ogg',        // OGG
  'audio/flac',       // FLAC
  'audio/x-m4a',      // M4A
]

const fileTypes = Platform.select({
  ios: iosTypes,
  android: androidTypes,
}) ?? [];

let getTaskInfoTimer:any = null

const AudioTranslationScreen: React.FC = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(UploadStatusEnum.TYPE_NORMAL);

  const [originalSwitch, setOriginalSwitch] = useState(OriginalSwitchEnum.TYPE_ORIGINAL);

  const [downloadModalShow, setDownloadModalShow] = useState(false)

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const { language } = useLanguage();
  const { show } = useMessageModal()

  const [beforeLangSelect, setBeforeLangSelect] = useState(language)
  const [afterLangSelect, setAfterLangSelect] = useState<Language>('en')
  const [selectFileInfo, setSelectFileInfo] = useState<any>(null)
  const createTaskTime = useRef(0)
  const [taskId, setTaskId] = useState('')
  const [taskInfo, setTaskInfo] = useState<any>(null)

  const [translationProgress, setTranslationProgress] = useState(0)

  const [isPlay, setIsPlay] = useState(false); // 音频是否在播放
  const [audioUrl, setAudioUrl] = useState(''); // 音频是否在播放

  const [playProgress, setPlayProgress] = useState(0); // 音频播放进度
  const [nowPlayTime, setNowPlayTime] = useState(''); // 音频当前播放时间
  const [audioDuration, setAudioDuration] = useState(''); // 音频总时长

  const [downloadType, setDownloadType] = useState('word')

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    // setLoading(true)
  };

  const selectFileBtnClick = async() => {
    // setUploadStatus(UploadStatusEnum.TYPE_SUCCESS)
    try {
      const res = await pick({
        type: fileTypes,
        allowMultiSelection: false,
      });
      console.log('res----', res);
      if (fileTypes.includes(res[0]?.type ?? '')) {
        console.log('文件格式正确');
      } else {
        show({
          message: t('translate_screen.document_filetype_error')
        })
        return
      }

      let totalSizeBytes = 0;

      res.forEach((file) => {
        totalSizeBytes += file.size ?? 0;
      });

      const totalSizeMB = totalSizeBytes / (1024 * 1024);

      if (totalSizeMB  > MAX_FILE_SIZE_MB) {
        console.warn(`${t('translate_screen.document_filesize_max1')} ${MAX_FILE_SIZE_MB}MB, ${t('translate_screen.document_filesize_max2')}`);
        return;
      }

      console.log('选中的文件:', res);

      // 在这里你可以处理上传等逻辑
      if (res && res.length > 0) {
        setLoading(true)

        // 定义要保存的文件信息（符合 FileToCopy 类型）
        const fileToCopy: FileToCopy = {
          uri: res[0].uri, // 原始临时路径
          fileName: res[0].name || '', // 原始文件名（带后缀）
          // 若为 Android 虚拟文件，需添加 convertVirtualFileToType
          // convertVirtualFileToType: result.convertibleToMimeTypes?.[0],
        };

        // 调用 keepLocalCopy 保存到 app 私有目录（文档目录或缓存目录）
        const saveResult = await keepLocalCopy({
          files: [fileToCopy], // 传入 FileToCopy 数组（非空）
          destination: 'documentDirectory', // 保存到文档目录（不被系统清理）
        });

        /**
         * savedFile数据格式
         * {
         * localUri: 'XXXX',
         * sourceUri: 'xxx',
         * status: 'success'
         * 
         * }
         */
        const savedFile = saveResult[0];

        console.log('savedFile---', savedFile);

        if (savedFile.status !== 'success' || !savedFile?.localUri) {
          console.error('持久化保存文件失败');
          throw new Error(`持久化保存文件失败`);
        }

        res[0].uri = savedFile.localUri

        const file = res[0];

        console.log('处理后的文件---', file);


        translateAudio({
          source_language: beforeLangSelect,
          target_language: afterLangSelect,
          audio_file: {
            uri: file.uri,
            name: file.name ?? Date.now() + '',
            type: file.type || 'application/octet-stream', // 兜底
          },
        }).then(response => {
          console.log('上传成功', response);
          setTaskId(response?.task_id)
          createTaskTime.current = Math.floor(performance.now())
          
          setLoading(false)
          setSelectFileInfo(res[0])
          setUploadStatus(UploadStatusEnum.TYPE_SUCCESS)
        }).catch(err => {
          setLoading(false)
          console.error('上传失败', err);
        });
      }

    } catch (err) {
        console.log('用户取消选择');
        // console.error('文件选择出错:', err);
    }
  }

  const getTaskInfo = () => {
    getTaskInfoTimer = setTimeout(() => {
      getTranslationAudioTask(taskId).then((rsp) => {
        if (rsp?.status !== 'success' && rsp?.status !== 'failed') {
          getTaskInfo()
          let percent = toPercent(Math.floor(performance.now()) - createTaskTime.current)
          setTranslationProgress(percent === 100 ? 99 : percent)
          
        } else {
          setTranslationProgress(100)
          setAudioUrl(rsp?.audio_file_url)
          setTimeout(() => {
            setTaskInfo(rsp)
            clearTimeout(getTaskInfoTimer)
            setUploadStatus(UploadStatusEnum.TYPE_TRANSLATION_SUCCESS)
          }, 1000)
          
        }
      }).catch(() => {
        cancelTranslationBtnClick()
        show({
          message: t('translate_screen.translation_fail')
        })
        
       
      })
    }, 3000)
  }

  const toPercent = (num: number) => {
    const percent = (num / TRANSLATION_MAX_TIME) * 100;
    return Math.min(Math.round(percent), 100); // 四舍五入并确保最大值为 100
  }

  const startTranslationBtnClick = () => {
    setTranslationProgress(0)
    getTaskInfo()
    setUploadStatus(UploadStatusEnum.TYPE_TRANSLATING)
  }
  const cancelTranslationBtnClick = () => {
    setUploadStatus(UploadStatusEnum.TYPE_NORMAL)
    setSelectFileInfo(null)
    createTaskTime.current = 0
    setTaskId('')
    setTaskInfo(null)
    clearTimeout(getTaskInfoTimer)
    setTranslationProgress(0)
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

  // 播放 / 暂停 控制
  const togglePlayPause = async () => {
    console.log('audioUrl---', audioUrl);
    
    if (!audioUrl) {
      return
    }
    if (!isPlay) {
      console.log('启动播放');
      
      setLoading(true)
      await AudioPlayerController.getInstance().init(audioUrl, {
        onInit: ({ duration, controller }) => {
          console.log('初始化完成，时长:', duration);
          console.log('controller----:', controller);
          setAudioDuration(duration)
          controller.play();
        },
        onPlay: () => {
          console.log('播放中');
          setIsPlay(true)
        },
        onPause: () => {
          console.log('暂停播放');
          // setIsPlay(false)
        },
        onStop: () => {
          console.log('停止播放');
          setIsPlay(false)
        },
        onProgress: ({ position, percent }) => {
          setLoading(false)
          setPlayProgress(percent)
          setNowPlayTime(position)
          console.log(`进度: ${position}， (${percent}%)`);
        },
        onEnd: () => {
          console.log('播放完成');
          setIsPlay(false)
        },
        onError: (error) => {
          console.error('错误:', error.message)
          setLoading(false)
        },
      });
    } else {
      console.log('用户停止播放---');
      AudioPlayerController.getInstance().stop()
      setNowPlayTime('')
      setPlayProgress(0)
    }
    
    
  };

  // 格式化时间
  const getFormattedTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  /**
   * 请求 Android 存储权限
   */
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: t('translate_screen.audio_permission_title'),
          message: t('translate_screen.audio_permission_desc'),
          buttonNeutral: t('translate_screen.audio_permission_btn1'),
          buttonNegative: t('translate_screen.document_cancel'),
          buttonPositive: t('translate_screen.camera_permission_ok'),
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('权限请求失败:', err);
      return false;
    }
  };

  const downloadFileFromUrl = async (url: string, fileName: string) => {
    if (Platform.OS === 'android') {
      const isPermission = requestStoragePermission()
      if (!isPermission) {
        console.log('无权限');
        return
      }
      downloadToDownloads(url, fileName)
      return
    }
    // 获取存储路径
    let localFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    const options = {
      fromUrl: url, // 网络文件地址
      toFile: localFilePath, // 本地保存路径
    };

    try {
      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        console.log('下载成功:', localFilePath);
        shareFile(localFilePath)
        return localFilePath;
      } else {
        console.warn('下载失败，状态码:', result.statusCode);
        return null;
      }
    } catch (err) {
      console.error('下载失败:', err);
      return null;
    }
  };

  const downloadToDownloads = async (url: string, name: string) => {
    const { FileSaver } = NativeModules;

    try {
      const savedPath = await FileSaver.saveFileToDownloadsUsingMediaStore(url, name);
      console.log('下载成功', `文件已保存到：\nDownload`);
      show({
        message: `${t('translate_screen.download_file_success')}: /Download`
      })
    } catch (e: any) {
      console.log('下载失败', e.message || '未知错误');
      show({
        message: t('translate_screen.download_file_error')
      })
    }
  };

  const downloadBtnClick = () => {
    if (originalSwitch === OriginalSwitchEnum.TYPE_ORIGINAL) {
      if (downloadType === 'word') {
        downloadFileFromUrl(taskInfo?.source_language_docx_url, `Melon_download_file_${Math.floor(performance.now())}.${taskInfo?.source_language_docx_url.split(/\.(?=[^\.]+$)/)[1]}`)
      } else {
        downloadFileFromUrl(taskInfo?.source_language_pdf_url, `Melon_download_file_${Math.floor(performance.now())}.${taskInfo?.source_language_pdf_url.split(/\.(?=[^\.]+$)/)[1]}`)
      }
    } else {
      if (downloadType === 'word') {
        downloadFileFromUrl(taskInfo?.translated_docx_url, `Melon_download_file_${Math.floor(performance.now())}.${taskInfo?.translated_docx_url.split(/\.(?=[^\.]+$)/)[1]}`)
      } else {
        downloadFileFromUrl(taskInfo?.translated_pdf_url, `Melon_download_file_${Math.floor(performance.now())}.${taskInfo?.translated_pdf_url.split(/\.(?=[^\.]+$)/)[1]}`)
      }
    }
  }

  const shareFile = async (filePath: string) => {

    try {
       // 目标文件路径（公有或可分享）
      const fileName = filePath.split('/').pop();
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      // 复制到缓存目录
      await RNFS.copyFile(filePath, destPath);
      const exists = await RNFS.exists(destPath);
      if (!exists) {
        console.warn('复制后的文件不存在，不能分享');
        return;
      }
      console.log('准备分享路径:', `file://${destPath}`);
      Share.open({
        url: 'file://' + destPath,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        showAppsToView: true,
      }).then((res) => {
        console.log('res---', res);
        if (res?.success) {
          show({
            message: t('translate_screen.save_file_success')
          })
        }
      })
    } catch (err) {
      console.log('分享失败:', err);
    }
  };

  useEffect(() => {
    return () => {
      AudioPlayerController.getInstance().release();
      clearTimeout(getTaskInfoTimer)
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
        text={t('translate_screen.audio_page_title')}
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
                  source={require('../../.../../../assets/images/AudioTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={styles.uploadTipText}>
                {`${t('translate_screen.audio_filetype_tip1')}\n(${t('translate_screen.audio_filetype_tip2')})`}
              </Text>
            </View>
          }

          {/* 上传成功界面 */}
          {
            uploadStatus === UploadStatusEnum.TYPE_SUCCESS &&
            <View style={[styles.uploadContent, {justifyContent: 'flex-start'}]}>
              <View style={[styles.fileImgView, styles.fileImgViewSmall]}>
                <Image
                  source={require('../../.../../../assets/images/AudioTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={[styles.uploadTipText, { marginTop: 24 }]}>
                {selectFileInfo?.name}
              </Text>
              <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 40}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text>
                    <Icon name="check-circle-fill" size={17} color={'#36F279'}/>
                  </Text>
                  <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: 10}}>{t('translate_screen.document_upload_success')} !</Text>
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
                  source={require('../../.../../../assets/images/AudioTranslation_File_Img.png')}
                  style={styles.fileImg}
                  resizeMode='contain'
                />
              </View>
              <Text style={[styles.uploadTipText, { marginTop: 24 }]}>
                {selectFileInfo?.name}
              </Text>
              <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 40}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{fontSize: 16, color: '#85F380', fontWeight: '500', marginLeft: translationProgress ? 10 : 0}}>
                    {t('translate_screen.document_translating')}{translationProgress ? `...${translationProgress}%` : ''}
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
                <Text style={styles.titleViewText} numberOfLines={1}>
                  {selectFileInfo?.name}
                </Text>
              </View>
              {
                originalSwitch === OriginalSwitchEnum.TYPE_ORIGINAL ?
                <View style={styles.wordContent}>
                  {
                    taskInfo?.transcription_results?.length && taskInfo?.transcription_results.map((item, index) => {
                      return (
                        <View key={index} style={styles.itemView}>
                          <View style={styles.itemLabelView}>
                            <Text style={styles.itemLabelText}>
                              Speaker {index + 1}
                            </Text>
                          </View>
                          <View style={styles.itemValueView}>
                            <Text style={styles.itemValueText}>
                              {item?.text}
                            </Text>
                          </View>
                        </View>
                      )
                    })
                  }

                </View>
                :
                <View style={styles.wordContent}>
                  {
                    taskInfo?.translated_results?.length && taskInfo?.translated_results.map((item: any, index: number) => {
                      return (
                        <View key={index} style={styles.itemView}>
                          <View style={styles.itemLabelView}>
                            <Text style={styles.itemLabelText}>
                              Speaker {index + 1}
                            </Text>
                          </View>
                          <View style={styles.itemValueView}>
                            <Text style={styles.itemValueText}>
                              {item?.text}
                            </Text>
                          </View>
                        </View>
                      )
                    })
                  }

                </View>
              }
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
                  {t('translate_screen.audio_uploadbtn_text')}
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
              onPress={cancelTranslationBtnClick}
            >
              <View style={styles.reUploadBtn}>
                <Text style={{
                  fontSize: 18,
                  color: '#fff',
                  fontWeight: '400'
                }}>
                  {t('translate_screen.document_reUpload')}
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
                  {t('translate_screen.document_source')}
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
                  {t('translate_screen.document_translated')}
                </Text>
              </TouchableOpacity>
            </View>
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
        uploadStatus === UploadStatusEnum.TYPE_NORMAL &&
        <View style={styles.langSelectRow}>
          <LangSelectCard
            beforeLanguage={beforeLangSelect}
            afterLanguage={afterLangSelect}
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
      }

      {/* 播放进度条 */}
      {
        uploadStatus === UploadStatusEnum.TYPE_TRANSLATION_SUCCESS &&
        <View style={{paddingHorizontal: 16, marginTop: 20}}>
          <ProgressBar
            progress={playProgress}
            backgroundColor='#333333'
            progressColor='#34C759'
            height={8}
          />
          <View style={styles.audioTimeView}>
            <Text style={styles.audioTimeText}>
              {nowPlayTime ? nowPlayTime : '00:00'}
            </Text>
            <Text style={styles.audioTimeText}>
              {audioDuration ? audioDuration : '--:--'}
            </Text>
          </View>
          <View style={styles.playBtnView}>
            {/* 播放按钮 */}
            <TouchableOpacity
              style={[
                styles.playBtn,
                isPlay && styles.playBtnStop
              ]}
              onPress={togglePlayPause}
            >
              <Image
                source={isPlay ? require('../../../assets/images/Audio_Stop.png') : require('../../../assets/images/Audio_play.png')}
                style={[styles.playBtnImg, !isPlay && {marginLeft: 2,}]}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
        </View>
      }

      {/* 下载弹窗 */}
      <PublicModal
        visible={downloadModalShow}
        backdropOpacity={0.1}
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
                    {t('translate_screen.document_down_title')}
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
                  onPress={() => setDownloadType('word')}
                >
                  <Animated.View
                    style={[
                      styles.fileTypeBtn,
                      {
                        borderColor: downloadType === 'word' ? '#85F380' : 'transparent'
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
                  onPress={() => setDownloadType('pdf')}
                >
                  <Animated.View
                    style={[
                      styles.fileTypeBtn,
                      {
                        borderColor: downloadType === 'pdf' ? '#85F380' : 'transparent'
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
                    {t('translate_screen.document_cancel')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBottomBtn, styles.modalBottomBtnGreen]}
                  onPress={downloadBtnClick}
                >
                  <Text style={[styles.modalBottomBtnText, styles.modalBottomBtnText2]}>
                    {t('translate_screen.document_downbtn')}
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
    alignSelf: 'stretch',
    marginTop: 20,
  },
  titleViewText: {
    fontSize: 17,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  wordContent: {
    marginTop: 16,
    gap: 16,
  },
  itemView: {},
  itemLabelView: {},
  itemLabelText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '500'
  },
  itemValueView: {
    marginTop: 8,
  },
  itemValueText: {
    color: '#B0B0B0',
    fontSize: 16,
    lineHeight: 22,
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
  downloadBtn: {
    marginLeft: 40,
  },
  langSelectRow: {
    width: '80%',
    marginLeft: pageLR,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
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
  audioTimeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  audioTimeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  playBtnView: {
    alignItems: 'center',
    marginTop: 6,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#86f3806c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnStop: {
    backgroundColor: '#EA43356c',
  },
  playBtnImg: {
    width: 18,
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

export default AudioTranslationScreen;
