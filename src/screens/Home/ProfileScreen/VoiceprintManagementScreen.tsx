import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getVoiceprintDemoConfig ,synthesizeSpeech, translateText} from '../../../api/profile/profile';
import { useMessageModal } from '../../../contexts/MessageModalContext';
import Sound from 'react-native-sound';
import { useVoiceStore } from '@/store';
import { VoiceType } from '@/store/modules/voice.store';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const langs={
  zh:'中文简体',
  en:'English',
  ja:'日语',
  de:'德语',
  fr:'法语',
  es:'西班牙语',
}

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type VoiceprintManagementScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'VoiceprintManagement'>;

const VoiceprintManagementScreen: React.FC = () => {
  const navigation = useNavigation<VoiceprintManagementScreenNavigationProp>();
  const [isRecording] = useState(false);
  const [voiceprintDemo, setVoiceprintDemo] = useState<any>(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [leftLanguage, setLeftLanguage] = useState<string>("zh");
  const [rightLanguage, setRightLanguage] = useState<string>("zh");
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const { show, hide } = useMessageModal();
  const [demoText, setDemoText] = useState<string>('');
  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageToggle = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (language: string) => {
    setRightLanguage(language);
    setShowLanguageModal(false);
    translateTextRequest(language);
  };

  const handleCreateVoice = () => {
    useVoiceStore.getState().setType(VoiceType.CREATE);
    navigation.navigate('CreateVoice');
  };

  const handleOptimizVoice = () => {
    useVoiceStore.getState().setType(VoiceType.OPTIMIZE);   
    navigation.navigate('CreateVoice');  
  };

  // 生成试听音频
  const handleSynthesizeSpeech = useCallback(async (text:string) => {
    setIsSynthesizing(true);
    try{
      const res = await synthesizeSpeech({
        text,
      });
      setAudioUrl(res.audio_url);
    }catch(error){
      show({message: 'Failed to synthesize speech'});
      console.log(error);
    }finally{
      setIsSynthesizing(false);
    }
  }, []);

  const translateTextRequest = async (language:string) => {
    try{
      const res = await translateText({
        format_type: 'text',
        source_language: leftLanguage,
        source_text: demoText,
        target_language: language,
      });
      setLeftLanguage(language);
      setDemoText(res.data.Translated);
      handleSynthesizeSpeech(res.data.Translated);
    }catch(error){
      console.log(error);
    }
  }
  // 播放音频
  const handlePlayAudio = () => {
    if (!audioUrl) {
      // show({message: 'No audio available'});
      Alert.alert('No audio available');
      return;
    }

    // 停止当前播放的音频
    if (sound) {
      sound.stop();
      sound.release();
    }

    // 创建新的音频实例
    const newSound = new Sound(audioUrl, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load audio:', error);
        show({message: 'Failed to load audio'});
        return;
      }

      // 音频加载成功，开始播放
      newSound.play((success) => {
        if (success) {
          console.log('Audio played successfully');
        } else {
          console.log('Audio playback failed');
        }
        setIsPlaying(false);
        newSound.release();
      });

      setIsPlaying(true);
    });

    setSound(newSound);
  };

  const getUserVoiceprintDemoRequest = useCallback(async () => {
    try{
      const res = await getVoiceprintDemoConfig();
      setVoiceprintDemo(res);
      setDemoText(res.demo_text);
      handleSynthesizeSpeech(res.demo_text);
    }catch(error){
      show({message: 'Failed to get voiceprint demo'});
      console.log(error);
    }
  }, [show, handleSynthesizeSpeech]);

  useEffect(() => {
     getUserVoiceprintDemoRequest();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top' ,'bottom']} >
       {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voiceprint Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 语音示例卡片 */}
      <View style={styles.voiceprintCard}>
        {/* 语音波形图标 */}
        <View style={styles.waveformContainer}>
          <Image source={require('../../../assets/profile/profile_voice_icon.png')} style={styles.voiceprintExampleIcon}/>
          {/* 标题 */}
          <Text style={styles.voiceprintTitle}>My voiceprint example</Text>
        </View>
        

        {/* 标语 */}
        <View style={styles.sloganContainer}>
          <Text style={styles.sloganText}>{demoText}</Text>
        </View>

        {/* 语言选择器 */}
        <TouchableOpacity style={styles.languageSelector} onPress={handleLanguageToggle}>
          <View style={styles.languageContainer}>
            <View style={styles.languageItem}>
                <Text style={[styles.languageText]}>
                  {langs[leftLanguage as keyof typeof langs]}
        </Text>
              <Image source={require('../../../assets/main/dropdown_disabled_icon.png')} resizeMode='contain' style={styles.dropdownIcon}/>
            </View>
            <Image source={require('../../../assets/main/exchange_icon.png')} resizeMode='contain' style={styles.exchangeIcon}/>
            <View style={styles.languageItem}>  
              <Text style={[
                styles.languageText,styles.languageTextActive
              ]}>
                {langs[rightLanguage as keyof typeof langs]}
        </Text>
             <Image source={require('../../../assets/main/dropdown_icon.png')} resizeMode='contain' style={styles.dropdownIcon}/>
            </View>
          </View>
        </TouchableOpacity>

        {/* 试听按钮 */}
        <TouchableOpacity style={[styles.trialButton,isSynthesizing && styles.trialButtonDisabled]} onPress={handlePlayAudio} disabled={isSynthesizing}>
          <Image source={require('../../../assets/profile/profile_play_icon.png')} resizeMode='contain' style={styles.playIcon}/>
          <Text style={styles.trialText}> 
            {isPlaying ? 'Playing...' : 'Trial listening'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 语音优化卡片 */}
      <TouchableOpacity style={styles.optimizationCard} onPress={handleOptimizVoice}>
        <View style={styles.optimizationContent}>
          <Image source={require('../../../assets/profile/profile_optimize_icon.png')} resizeMode='contain' style={styles.optimizationIcon}/>
          <Text style={styles.optimizationTitle}>Voiceprint optimization</Text>
          <View style={styles.arrowContainer}>
            <Image 
              source={require('../../../assets/main/right_arrow_icon.png')} 
              style={styles.arrowIcon}
            />
          </View>
        </View>
        </TouchableOpacity>

        {/* 录音按钮 */}
        <TouchableOpacity 
          style={[styles.recordButton, isRecording && styles.recordButtonActive]} 
          onPress={handleCreateVoice}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? 'Recording...' : 'Recording the Main Sound'}
          </Text>
        </TouchableOpacity>

        {/* 语言选择弹窗 */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择语言</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.languageList}>
                {voiceprintDemo?.supported_languages?.map((language: any, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.languageOption} 
                    onPress={() => handleLanguageSelect(language)}
                  >
                    <Text style={styles.languageOptionText}>{langs[language as keyof typeof langs]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    paddingTop: normalize(20),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    marginTop: normalize(12),
  },
  timeText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  titleContainer: {
    marginTop: normalize(20),
    marginBottom: normalize(8),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: normalize(40),
  },
  voiceprintCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(16),
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  voiceprintExampleIcon: {
    width: normalize(17),
    height: normalize(15),
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: normalize(1),
    height: normalize(20),
  },
  waveformBar: {
    width: normalize(1.5),
    backgroundColor: '#85F380',
    borderRadius: normalize(1),
  },
  voiceprintTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    marginLeft: normalize(7),
  },
  sloganContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: normalize(12),
    padding: normalize(14),
    marginBottom: normalize(16),
  },
  sloganText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  languageSelector: {
    marginBottom: normalize(16),
  },
  languageContainer: {
    width: normalize(260),
    flexDirection: 'row',
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: normalize(12),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
    justifyContent: 'space-around',
  },
  languageItem: {
    flexDirection: 'row',
    gap: normalize(10),
    alignItems: 'center',
  },
  languageText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'left',
  },
  dropdownIcon: {
    width: normalize(10),
    height: normalize(6),
  },
  exchangeIcon: {
    width: normalize(16),
    height: normalize(14),
  },
  languageTextActive: {
    color: '#FFFFFF',
  },
  languageIndicator: {
    position: 'absolute',
    top: normalize(22),
    left: normalize(85),
    width: normalize(10.67),
    height: normalize(6),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: normalize(3),
  },
  languageIndicatorRight: {
    left: normalize(225),
  },
  trialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: normalize(8),
  },
  trialButtonDisabled: {
    opacity: 0.5,
  },
  trialText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#85F380',
    letterSpacing: -0.4,
  },
  playIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: normalize(8),
    borderRightWidth: 0,
    borderBottomWidth: normalize(6),
    borderTopWidth: normalize(6),
    borderLeftColor: '#85F380',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  optimizationCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(24),
    height: normalize(58),
  },
  optimizationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optimizationIcon: {
    width: normalize(27),
    height: normalize(27),
    borderRadius: normalize(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: normalize(16),
    height: normalize(16),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: normalize(2),
  },
  optimizationTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: normalize(12),
    letterSpacing: -0.4,
  },
  arrowContainer: {
    width: normalize(24),
    height: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  recordButton: {
    position:'absolute',
    width:"100%",
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    marginHorizontal:normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(24),
    bottom:normalize(0)
  },
  recordButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  recordButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  createVoiceButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
  },
  createVoiceButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    width: normalize(300),
    maxHeight: normalize(400),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: normalizeFontSize(18),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: normalize(300),
  },
  languageOption: {
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageOptionText: {
    fontSize: normalizeFontSize(14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default VoiceprintManagementScreen; 