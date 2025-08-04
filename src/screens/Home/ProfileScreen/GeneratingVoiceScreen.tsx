import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { generateVoiceId } from '@/api/profile/profile';
import { useVoiceStore } from '@/store';
import { VoiceType } from '@/store/modules/voice.store';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type GeneratingVoiceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'GeneratingVoice'>;

const GeneratingVoiceScreen: React.FC = () => {
  const navigation = useNavigation<GeneratingVoiceScreenNavigationProp>();
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;
  const [progress, setProgress] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const { show } = useMessageModal();
  const { t } = useLanguage();
  useEffect(() => {

      generateVoiceIdRequest();

    // 模拟进度更新
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5 + 3;
        if (newProgress >= 100) {
          // 进度完成后显示弹窗
          // setTimeout(() => {
          //   setShowCompletionModal(true);
          // }, 1000);
          if(useVoiceStore.getState().type === VoiceType.CREATE){
            // 跳转专属音色页面
            navigation.replace('LanguageVoice');
          }else{
            // 跳转专属音色页面
            setShowCompletionModal(true);
          }
          return 100;
        }
        return newProgress;
      });
    }, 500);

    return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateVoiceIdRequest = async () => {
    const recordFile = useVoiceStore.getState().recordVoiceFile;
      console.log(recordFile,'recordFile')
      try {
        const res = await generateVoiceId({ 
          audio_file: recordFile,
        });
        console.log(res,'res')
        // show({message: 'Voice ID generated successfully'});
      } catch (error) {
        show({message: t('generating_voice.failed_to_generate_voice_id')});
        console.log(error,'error')
      }
    }


  const handleBack = () => {
    navigation.goBack();
  };

  const handleReRecording = () => {
    setShowCompletionModal(false);
    useVoiceStore.getState().setVoiceFile({
      uri: '',
      type: '',
      name: '',
    });
    useVoiceStore.getState().setLocal("");
    navigation.navigate('CreateVoice');
  };

  const handleConfirm = () => {
    setShowCompletionModal(false);
    // 跳转到 ProfileHome 页面，注意这里应该直接跳转到 ProfileHome，而不是 ProfileNavigator
    useVoiceStore.getState().setVoiceFile({
      uri: '',
      type: '',
        name: '',
      });
    useVoiceStore.getState().setLocal("");
    navigation.replace('ProfileMain');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
     <ScrollView>
       {/* 背景图片 */}
       <Image 
        source={require('../../../assets/profile/profile_generate_bg.png')} 
        style={styles.backgroundImage} 
      />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{useVoiceStore.getState().type === VoiceType.CREATE ? t('generating_voice.create_your_own_voice') : t('generating_voice.voiceprint_optimization')}</Text>
        <View style={styles.headerSpacer} />
      </View>

       {/* 动画容器 */}
       <View style={styles.animationContainer}>
        <LottieView
          source={require('../../../assets/lottie/generate_voice.json')}
          style={styles.lottieAnimation}
          autoPlay
          loop
          speed={1}
        />
      </View>

      {/* 进度百分比 */}
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>

      {/* 状态文本 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {t('generating_voice.your_exclusive_tone_generating')}
        </Text>
      </View>
     </ScrollView>

     {/* 生成完成弹窗 */}
     <Modal
       visible={showCompletionModal}
       transparent={true}
       animationType="fade"
       onRequestClose={() => setShowCompletionModal(false)}
     >
       <View style={styles.modalOverlay}>
         <View style={styles.modalContainer}>
           {/* 标题和描述 */}
           <View style={styles.modalContent}>
             <View style={styles.iconContainer}>
                 <Image 
                   source={require('../../../assets/main/success_icon.png')} 
                   style={styles.successIconImage}
                 />
             </View>
             
             <Text style={styles.modalTitle}>
               {t('generating_voice.voiceprint_optimization_complete')}
             </Text>
             
             <Text style={styles.modalDescription}>
               {t('generating_voice.listen_optimization_effect')}
             </Text>
           </View>

           {/* 按钮 */}
           <View style={styles.modalButtons}>
             <TouchableOpacity 
               style={styles.modalButton} 
               onPress={handleReRecording}
             >
               <Text style={styles.reRecordingText}>{t('generating_voice.re_recording')}</Text>
             </TouchableOpacity>
             
             <View style={styles.buttonSeparator} />
             
             <TouchableOpacity 
               style={styles.modalButton} 
               onPress={handleConfirm}
             >
               <Text style={styles.confirmText}>{t('generating_voice.confirm')}</Text>
             </TouchableOpacity>
           </View>
         </View>
       </View>
     </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  backgroundImage: {
    position: 'absolute',
    top: normalize(0),
    left: normalize(-224),
    width: normalize(831),
    height: normalize(747),
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerSpacer: {
    width: normalize(40),
  },
  title: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(400),
    marginTop: normalize(0),
  },
  lottieAnimation: {
    width: normalize(517),
    height: normalize(517),
  },
  progressText: {
    fontSize: normalizeFontSize(25),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: normalize(20),
  },
  statusText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: normalize(20),
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: normalize(327),
    backgroundColor: '#333333',
    borderRadius: normalize(8),
    overflow: 'hidden',
    paddingTop: normalize(12),
  },
  modalContent: {
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(16),
    paddingTop: normalize(12),
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: normalize(4),
    paddingBottom: normalize(8),
  },
  successIcon: {
    width: normalize(48),
    height: normalize(48),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconImage: {
    width: normalize(36),
    height: normalize(36),
    tintColor: '#36F279',
  },
  modalTitle: {
    fontSize: normalizeFontSize(17),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
    marginBottom: normalize(4),
  },
  modalDescription: {
    fontSize: normalizeFontSize(13),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: normalize(18),
    letterSpacing: -0.4,
  },
  modalButtons: {
    flexDirection: 'row',
    borderTopWidth: normalize(0.33),
    borderTopColor: '#4F4F4F',
  },
  modalButton: {
    flex: 1,
    height: normalize(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSeparator: {
    width: normalize(0.33),
    height: normalize(44),
    backgroundColor: '#4F4F4F',
  },
  reRecordingText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
  },
  confirmText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '600',
    color: '#85F380',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
  },
});

export default GeneratingVoiceScreen; 